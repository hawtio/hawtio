/// <reference path="osgiPlugin.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
module Osgi {

  export var TopLevelController = _module.controller("Osgi.TopLevelController", ["$scope", "workspace", ($scope, workspace:Core.Workspace) => {

    $scope.frameworkMBean = Osgi.getSelectionFrameworkMBean(workspace);
    $scope.bundleMBean = Osgi.getSelectionBundleMBean(workspace);
    $scope.serviceMBean = Osgi.getSelectionServiceMBean(workspace);
    $scope.packageMBean = Osgi.getSelectionPackageMBean(workspace);
    $scope.configAdminMBean = Osgi.getSelectionConfigAdminMBean(workspace);
    $scope.metaTypeMBean = Osgi.getMetaTypeMBean(workspace);
    $scope.osgiToolsMBean = Osgi.getHawtioOSGiToolsMBean(workspace);
    $scope.hawtioConfigAdminMBean = Osgi.getHawtioConfigAdminMBean(workspace);
    $scope.scrMBean = Karaf.getSelectionScrMBean(workspace);
    $scope.featuresMBean = Karaf.getSelectionFeaturesMBean(workspace);


  }]);

}
