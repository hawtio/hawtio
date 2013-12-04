module Fabric {

  export function ContainersController($scope, $location, $route, jolokia, workspace) {

    Fabric.initScope($scope, $location, jolokia, workspace);

    // bind model values to search params...
    Core.bindModelToSearchParam($scope, $location, "containerIdFilter", "q", "");

    // only reload the page if certain search parameters change
    Core.reloadWhenParametersChange($route, $scope, $location);

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

        if ($scope.selectedContainers.length > 0) {
          $scope.activeContainerId = '';
        }
      }
    }, true);


    $scope.showChangeVersionDialog = () => {
      $scope.changeVersionDialog.open($scope.selectedContainers);
    };
  }

}
