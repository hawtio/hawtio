/// <reference path="fabricPlugin.ts"/>
/// <reference path="fabricInterfaces.ts"/>
/// <reference path="containerHelpers.ts"/>
module Fabric {

  _module.controller("Fabric.ContainersController", ["$scope", "$location", "$route", "jolokia", "workspace", "$dialog", ($scope, $location, $route, jolokia, workspace, $dialog) => {

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.selectedContainers = <Array<Container>>[];
    $scope.createLocationDialog = ContainerHelpers.getCreateLocationDialog($scope, $dialog);
    // bind model values to search params...
    Core.bindModelToSearchParam($scope, $location, "containerIdFilter", "q", "");

    // only reload the page if certain search parameters change
    Core.reloadWhenParametersChange($route, $scope, $location);

    // is it possible to delete selected containers? no, if deletion of container didn't complete
    $scope.showDeleteButton = () => {
      return $scope.selectedContainers.length > 0 && $scope.selectedContainers.all((c) =>
          { return !$scope.deletePending[c.id] && !(c.root && $scope.ensembleContainerIds.includes(c.id))});
    };

    $scope.addToDashboardLink = () => {
      var href = "#/fabric/containers";
      var title = "Containers";
      var size = angular.toJson({size_y:1, size_x: 4});

      return "#/dashboard/add?tab=dashboard" +
          "&href=" + encodeURIComponent(href) +
          "&size=" + encodeURIComponent(size) +
          "&title=" + encodeURIComponent(title);
    };

    $scope.$watch('containers', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedContainers = $scope.containers.filter((c) => { return c.selected; });

        var locations = ContainerHelpers.extractLocations($scope.containers);
        $scope.locationMenu = ContainerHelpers.buildLocationMenu($scope, jolokia, locations)

        if ($scope.selectedContainers.length > 0) {
          $scope.activeContainerId = '';
        }

        $scope.containers.forEach((container) => {
          if (Core.isBlank(container.location)) {
            container.location = ContainerHelpers.NO_LOCATION;
          }
        });
      }
    }, true);
  }]);
}
