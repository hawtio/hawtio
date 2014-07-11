/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/storageHelpers.ts"/>
/// <reference path="../../helpers/js/controllerHelpers.ts"/>
/// <reference path="../../helpers/js/filterHelpers.ts"/>
module Fabric {

  export var ContainerViewController = _module.controller("Fabric.ContainerViewController", ["$scope", "jolokia", "$location", "localStorage", "$route", ($scope, jolokia, $location, localStorage, $route) => {

    $scope.name = ContainerViewController.name;
    $scope.containers = <Array<Container>>[];
    $scope.groupBy = 'profileIds';
    $scope.filter = '';

    var containerFields = ['id', 'profileIds', 'profiles', 'versionId', 'location', 'alive', 'type', 'ensembleServer', 'provisionResult'];
    var profileFields = ['id', 'hidden', 'version', 'summaryMarkdown', 'iconURL'];

    Fabric.loadRestApi(jolokia, $scope);

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'groupBy',
      paramName: 'groupBy',
      intialValue: $scope.groupBy
    });

    $scope.groupByClass = ControllerHelpers.createClassSelector({
      'profileIds': 'btn-primary',
      'location': 'btn-primary',
      'none': 'btn-primary'
    });

    $scope.filterContainers = (container) => {
      return FilterHelpers.searchObject(container, $scope.filter);
    }

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
      var versions = {};
      var locations = {};
      // massage the returned data a bit first
      containers.forEach((container) => {
        if (Core.isBlank(container.location)) {
          container.location = Fabric.NO_LOCATION;
        }
        container.profiles = container.profiles.filter((p) => { return !p.hidden });
        container.icon = Fabric.getTypeIcon(container);
      });
      var versions = groupByVersions(containers);
      angular.forEach(versions, (version, versionId) => {
        version.profiles.forEach((profile) => {
          var containers = version.containers.filter((c) => { return c.profileIds.some(profile.id); });
          profile.aliveCount = containers.count((c) => { return c.alive; });
          profile.deadCount = containers.length - profile.aliveCount;
          profile.summary = profile.summaryMarkdown ? marked(profile.summaryMarkdown) : '';
          profile.iconURL = Fabric.toIconURL($scope, profile.iconURL);
        });
      });
      var locations = groupByLocation(containers);
      $scope.locations = locations;
      $scope.versions = versions;
      $scope.containers = containers;
      Core.$apply($scope);
    });

  }]);
}
