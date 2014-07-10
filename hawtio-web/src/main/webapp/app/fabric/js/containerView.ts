/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/storageHelpers.ts"/>
/// <reference path="../../helpers/js/controllerHelpers.ts"/>
/// <reference path="../../helpers/js/filterHelpers.ts"/>
module Fabric {

  export var ContainerViewController = _module.controller("Fabric.ContainerViewController", ["$scope", "jolokia", "$location", "localStorage", "$route", ($scope, jolokia, $location, localStorage, $route) => {

    $scope.name = ContainerViewController.name;
    $scope.containers = <Container[]>Array();
    $scope.groupBy = 'profileIds';
    $scope.filter = '';

    var containerFields = ['id', 'profileIds', 'profiles', 'versionId', 'location'];
    var profileFields = ['id', 'hidden'];

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
      'location': 'btn-primary'
    });

    $scope.addNewlineClass = ControllerHelpers.createValueClassSelector({
      'true': '',
      'false': 'column-row'
    });

    $scope.filterContainers = (container) => {
      return FilterHelpers.searchObject(container, $scope.filter);
    }

    $scope.booleanToString = Core.booleanToString;

    function render(response) {
      $scope.containers = response.value;
      // massage the returned data a bit
      $scope.containers.forEach((container) => {
        if (Core.isBlank(container.location)) {
          container.location = Fabric.NO_LOCATION;
        }
        container.profileIds = container.profileIds.filter((id) => {
          var profile = container.profiles.find((p) => { return p.id === id; });
          if (profile && profile.hidden) {
            return false;
          } else {
            return true;
          }
        });
      });
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
