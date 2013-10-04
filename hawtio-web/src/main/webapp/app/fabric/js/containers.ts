module Fabric {

  export function ContainersController($scope) {

    $scope.containerIdFilter = '';

    $scope.getFilteredName = (item) => {
      return item.versionId + " / " + item.id;
    }

    $scope.addToDashboardLink = () => {
      var href = "#/fabric/containers";
      var title = "Containers";
      var size = angular.toJson({size_y:1, size_x: 4});

      return "#/dashboard/add?tab=dashboard" +
          "&href=" + encodeURIComponent(href) +
          "&size=" + encodeURIComponent(size) +
          "&title=" + encodeURIComponent(title);
    };

    $scope.filterContainer = (container) => {
      if (!$scope.getFilteredName(container).has($scope.containerIdFilter)) {
        return false;
      }
      return true;
    };

    $scope.$watch('containers', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedContainers = $scope.containers.filter((c) => { return c.selected; });

        if ($scope.selectedContainers.length > 0) {
          $scope.activeContainerId = '';
        }
      }
    }, true);


  }

}
