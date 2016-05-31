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
    $scope.groupBy = 'none';
    $scope.filter = '';
    $scope.cartItems = [];
    $scope.versionIdFilter = '';
    $scope.profileIdFilter = '';
    $scope.locationIdFilter = '';
    $scope.hasCounts = true;
    $scope.toString = Core.toString;
    $scope.filterContainersText = 'Filter Containers...';
    $scope.filterProfilesText = 'Filter Profiles...';
    $scope.filterLocationsText = 'Filter Locations...';
    $scope.filterBoxText = $scope.filterContainersText;
    $scope.selectedTags = [];

    $scope.createLocationDialog = ContainerHelpers.getCreateLocationDialog($scope, $dialog);

    var containerFields = ['id', 'profileIds', 'profiles', 'versionId', 'location', 'alive', 'type', 'ensembleServer', 'provisionResult', 'root', 'jolokiaUrl', 'jmxDomains', 'metadata', 'parentId'];
    var profileFields = ['id', 'hidden', 'version', 'summaryMarkdown', 'iconURL', 'tags'];

    Fabric.initScope($scope, $location, jolokia, workspace);
    SelectionHelpers.decorate($scope);
    // when viewing profile boxes in container view, disable checkboxes
    $scope.viewOnly = true;

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'groupBy',
      paramName: 'groupBy',
      initialValue: $scope.groupBy
    });

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'versionIdFilter',
      paramName: 'versionIdFilter',
      initialValue: $scope.versionIdFilter
    });

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'profileIdFilter',
      paramName: 'profileIdFilter',
      initialValue: $scope.profileIdFilter
    });

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'locationIdFilter',
      paramName: 'locationIdFilter',
      initialValue: $scope.locationIdFilter
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

    $scope.showContainersFor = (thing) => {
      if (angular.isString(thing)) {
        $scope.locationIdFilter = thing;
      } else {
        $scope.profileIdFilter = thing.id;
        $scope.versionIdFilter = thing.version;
      }
      $scope.groupBy = 'none';
    }

    $scope.filterLocation = (locationId) => {
      return FilterHelpers.searchObject(locationId, $scope.filter);
    }
    
    $scope.filterProfiles = (profile) => {
      return FilterHelpers.searchObject(profile.id, $scope.filter);
    }

    $scope.filterContainers = (container) => {
      if (!Core.isBlank($scope.versionIdFilter) && container.versionId !== $scope.versionIdFilter) {
        return false;
      }
      if (!Core.isBlank($scope.profileIdFilter) && !container.profileIds.any($scope.profileIdFilter)) {
        return false;
      }
      if (!Core.isBlank($scope.locationIdFilter) && container.location !== $scope.locationIdFilter) {
        return false;
      }
      return FilterHelpers.searchObject(container.id, $scope.filter);
    }

    $scope.filterContainer = $scope.filterContainers;

    $scope.viewProfile = (profile:Profile) => {
      Fabric.gotoProfile(workspace, jolokia, workspace.localStorage, $location, profile.version, profile.id);
    };

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

    Fabric.loadRestApi(jolokia, workspace, undefined, (response) => {
      $scope.restApiUrl = UrlHelpers.maybeProxy(Core.injector.get('jolokiaUrl'), response.value);
      log.debug("Scope rest API: ", $scope.restApiUrl);
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
            container.location = ContainerHelpers.NO_LOCATION;
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

        // Sort by id with child containers grouped under parents
        var sortedContainers = containers.sortBy('id');
        var rootContainers = sortedContainers.exclude((c) => { return !c.root; });
        var childContainers = sortedContainers.exclude((c) => { return c.root; });

        if (childContainers.length > 0) {
          var tmp = [];
          rootContainers.each((c) => {
            tmp.add(c);
            var children = childContainers.exclude((child) => { return child.parentId !== c.id });
            tmp.add(children);
          });
          containers = tmp;
        }

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
    });

  }]);
}
