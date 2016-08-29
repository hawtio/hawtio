/// <reference path="fabricPlugin.ts"/>
module Fabric {
  _module.controller("Fabric.ActiveProfileController", ["$scope", "jolokia", ($scope, jolokia) => {
    $scope.managerMBean = Fabric.managerMBean;
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
  }]);
}
