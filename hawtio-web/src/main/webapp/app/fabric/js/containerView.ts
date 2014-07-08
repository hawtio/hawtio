/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/storageHelpers.ts"/>
/// <reference path="../../helpers/js/controllerHelpers.ts"/>
module Fabric {

  export var ContainerViewController = _module.controller("Fabric.ContainerViewController", ["$scope", "jolokia", "$location", "localStorage", "$route", ($scope, jolokia, $location, localStorage, $route) => {

    $scope.name = ContainerViewController.name;
    $scope.containerGroups = {};
    $scope.containers = <Container[]>Array();
    $scope.groupBy = 'profiles';

    var containerFields = ['id', 'profileIds', 'versionId', 'location'];
    var profileFields = ['id'];

    StorageHelpers.bindModelToLocalStorage({
      $scope: $scope,
      $location: $location,
      localStorage: localStorage,
      modelName: 'groupBy',
      paramName: 'groupBy',
      intialValue: $scope.groupBy,
      onChange: (groupBy) => {
        if (Core.isBlank(groupBy)) {
          return;
        }
        $scope.containerGroups = buildGroup(groupMapping, groupBy, $scope.containers);
      }
    });

    $scope.$watch('containerGroups', (newValue, oldValue) => {
      log.debug("Container groups: ", newValue);
    });

    $scope.groupByClass = ControllerHelpers.createClassSelector({
      'profiles': 'btn-primary',
      'location': 'btn-primary'
    });

    var groupMapping = {
      profiles: 'profileIds',
      location: 'location'
    };

    function buildGroup(groupMapping:any, groupBy:string, containers:Container[]):any {
      return containers.groupBy((c) => {
        return c[groupMapping[groupBy]];
      });
    }

    function render(response) {
      $scope.containers = response.value;
      $scope.containerGroups = buildGroup(groupMapping, $scope.groupBy, $scope.containers);
      Core.$apply($scope);
    }

    Core.registerForChanges(jolokia, $scope, {
      type: 'exec',
      mbean: Fabric.managerMBean,
      operation: 'containers(java.util.List, java.util.List)',
      arguments:[containerFields, profileFields]
    }, render);

  }]);
}
