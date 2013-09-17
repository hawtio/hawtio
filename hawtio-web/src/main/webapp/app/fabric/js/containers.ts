module Fabric {

  export function ContainersController($scope) {

    $scope.containerIdFilter = '';
    $scope.userName = localStorage['fabric.userName'];
    $scope.password = localStorage['fabric.password'];
    $scope.saveCredentials = false;

    $scope.getFilteredName = (item) => {
      return item.versionId + " / " + item.id;
    }

    $scope.addToDashboardLink = () => {
      var href = "#/fabric/containers";

      return "#/dashboard/add?tab=dashboard&href=" + encodeURIComponent(href) + "&size=" + encodeURIComponent(angular.toJson({size_y:1, size_x: 4}));
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
