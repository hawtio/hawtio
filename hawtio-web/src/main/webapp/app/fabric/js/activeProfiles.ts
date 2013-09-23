module Fabric {

  export function ActiveProfileController($scope, jolokia) {

    $scope.addToDashboardLink = () => {
      var href = "#/fabric/activeProfiles"
      var title = "Active Profiles"
      var size = angular.toJson({
        size_y: 1,
        size_x: 5
      });

      return "#/dashboard/add?tab=dashboard" +
          "&href=" + encodeURIComponent(href) +
          "&size=" + encodeURIComponent(size) +
          "&title=" + encodeURIComponent(title);
    }


  }

}
