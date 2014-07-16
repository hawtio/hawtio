/// <reference path="./fabricPlugin.ts"/>
/// <reference path="./profileHelpers.ts"/>
/// <reference path="./containerHelpers.ts"/>
/// <reference path="../../helpers/js/storageHelpers.ts"/>
/// <reference path="../../helpers/js/controllerHelpers.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
/// <reference path="../../helpers/js/filterHelpers.ts"/>
module Fabric {

  export var ContainerViewController = _module.controller("Fabric.ContainerViewController", ["$scope", "jolokia", "$location", "localStorage", "$route", "workspace", "marked", "ProfileCart", "$dialog", ($scope, jolokia, $location, localStorage, $route, workspace:Workspace, marked, ProfileCart, $dialog) => {

    $scope.name = ContainerViewController.name;
    $scope.containers = <Array<Container>>[];
    $scope.selectedContainers = <Array<Container>>[];
    $scope.groupBy = 'profileIds';
    $scope.filter = '';
    $scope.cartItems = ProfileCart;
    $scope.versionIdFilter = '';
    $scope.profileIdFilter = '';

    $scope.createLocationDialog = ContainerHelpers.getCreateLocationDialog($scope, $dialog);

    var containerFields = ['id', 'profileIds', 'profiles', 'versionId', 'location', 'alive', 'type', 'ensembleServer', 'provisionResult', 'root', 'jolokiaUrl', 'jmxDomains', 'metadata'];
    var profileFields = ['id', 'hidden', 'version', 'summaryMarkdown', 'iconURL', 'tags'];

    Fabric.loadRestApi(jolokia, $scope);
    Fabric.initScope($scope, $location, jolokia, workspace);
    SelectionHelpers.decorate($scope);

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'groupBy',
      paramName: 'groupBy',
      intialValue: $scope.groupBy
    });

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'versionIdFilter',
      paramName: 'versionIdFilter',
      intialValue: $scope.versionIdFilter
    });

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'profileIdFilter',
      paramName: 'profileIdFilter',
      intialValue: $scope.profileIdFilter
    });

    $scope.groupByClass = ControllerHelpers.createClassSelector({
      'profileIds': 'btn-primary',
      'location': 'btn-primary',
      'none': 'btn-primary'
    });

    $scope.$watch('containers', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.selectedContainers = $scope.containers.filter((container) => { return container['selected']; });
      }
    }, true);


    $scope.maybeShowLocation = () => {
      return ($scope.groupBy === 'location' || $scope.groupBy === 'none') && $scope.selectedContainers.length > 0;
    }

    $scope.showContainersFor = (profile) => {
      $scope.profileIdFilter = profile.id;
      $scope.versionIdFilter = profile.version;
      $scope.groupBy = 'none';
    }

    $scope.filterContainers = (container) => {
      if (!Core.isBlank($scope.versionIdFilter) && container.versionId !== $scope.versionIdFilter) {
        return false;
      }
      if (!Core.isBlank($scope.profileIdFilter) && !container.profileIds.any($scope.profileIdFilter)) {
        return false;
      }
      return FilterHelpers.searchObject(container, $scope.filter);
    }

    $scope.hasCounts = true;
    $scope.filterContainer = $scope.filterContainers;
    $scope.toString = Core.toString;

    function maybeAdd(group: Array<any>, thing:any, index:string) {
      if (angular.isArray(thing)) {
        thing.forEach((i) => { maybeAdd(group, i, index); });
      } else {
        if (!group.any((item) => { return thing[index] === item[index] })) {
          group.add(thing);
        }
      }
    }

    function groupByVersions(containers:Array<Container>) {
      var answer = {};
      containers.forEach((container) => {
        var versionId = container.versionId;
        var version = answer[versionId] || { containers: <Array<Container>>[], profiles: <Array<Profile>>[] };
        maybeAdd(version.containers, container, 'id');
        maybeAdd(version.profiles, container.profiles, 'id');
        answer[versionId] = version;
      });
      return answer;
    }

    function groupByLocation(containers:Array<Container>) {
      var answer = {};
      containers.forEach((container) => {
        var location = container.location;
        var loc = answer[location] || { containers: Array<Container>() };
        maybeAdd(loc.containers, container, 'id');
        answer[location] = loc;
      });
      return answer;
    }

    Core.registerForChanges(jolokia, $scope, {
      type: 'exec',
      mbean: Fabric.managerMBean,
      operation: 'containers(java.util.List, java.util.List)',
      arguments:[containerFields, profileFields]
    }, (response) => {
      var containers = response.value;
      SelectionHelpers.sync($scope.selectedContainers, containers, 'id');
      var versions = {};
      var locations = {};
      // massage the returned data a bit first
      containers.forEach((container) => {
        if (Core.isBlank(container.location)) {
          container.location = Fabric.NO_LOCATION;
        }
        container.profiles = container.profiles.filter((p) => { return !p.hidden });
        container.icon = Fabric.getTypeIcon(container);
        container.services = Fabric.getServiceList(container);
      });
      var versions = groupByVersions(containers);
      angular.forEach(versions, (version, versionId) => {
        version.profiles.forEach((profile) => {
          var containers = version.containers.filter((c) => { return c.profileIds.some(profile.id); });
          profile.aliveCount = containers.count((c) => { return c.alive; });
          profile.deadCount = containers.length - profile.aliveCount;
          profile.summary = profile.summaryMarkdown ? marked(profile.summaryMarkdown) : '';
          profile.iconURL = Fabric.toIconURL($scope, profile.iconURL);
          profile.tags = ProfileHelpers.getTags(profile);
        });
      });
      var locations = groupByLocation(containers);
      var locationIds = ContainerHelpers.extractLocations(containers);
      $scope.locationMenu = ContainerHelpers.buildLocationMenu($scope, jolokia, locationIds);
      // grouped by location
      $scope.locations = locations;
      // grouped by version/profile
      $scope.versions = versions;
      // list view
      $scope.containers = containers;
      Core.$apply($scope);
    });

    Core.registerForChanges(jolokia, $scope, {
      type: 'read',
      mbean: Fabric.clusterManagerMBean,
      attribute: 'EnsembleContainers'
    }, (response) => {
      $scope.ensembleContainerIds = response.value;
      Core.$apply($scope);
    });

  }]);
}
