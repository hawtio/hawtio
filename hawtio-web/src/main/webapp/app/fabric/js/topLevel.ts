/// <reference path="fabricPlugin.ts"/>
/// <reference path="fabricGlobals.ts"/>
module Fabric {

  export var TopLevelController = _module.controller("Fabric.TopLevelController", ['$scope', ($scope) => {
    $scope.managerMBean = Fabric.managerMBean;
    $scope.clusterBootstrapManagerMBean = Fabric.clusterBootstrapManagerMBean;
    $scope.clusterManagerMBean = Fabric.clusterManagerMBean;
    $scope.openShiftFabricMBean = Fabric.openShiftFabricMBean;
    $scope.mqManagerMBean = Fabric.mqManagerMBean;
    $scope.healthMBean = Fabric.healthMBean;
    $scope.schemaLookupMBean = Fabric.schemaLookupMBean;

  }]);
}
