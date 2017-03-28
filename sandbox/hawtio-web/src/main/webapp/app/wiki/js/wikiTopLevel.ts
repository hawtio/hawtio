/// <reference path="wikiPlugin.ts"/>
/// <reference path="../../fabric/js/fabricGlobals.ts"/>
/// <reference path="../../git/js/gitHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../osgi/js/osgiHelpers.ts"/>
module Wiki {

  export var TopLevelController = _module.controller("Wiki.TopLevelController", ['$scope', 'workspace', 'jolokia', ($scope, workspace:Core.Workspace, jolokia) => {
    $scope.managerMBean = Fabric.managerMBean;
    $scope.clusterBootstrapManagerMBean = Fabric.clusterBootstrapManagerMBean;
    $scope.clusterManagerMBean = Fabric.clusterManagerMBean;
    $scope.openShiftFabricMBean = Fabric.openShiftFabricMBean;
    $scope.mqManagerMBean = Fabric.mqManagerMBean;
    $scope.healthMBean = Fabric.healthMBean;
    $scope.schemaLookupMBean = Fabric.schemaLookupMBean;
    $scope.gitMBean = Git.getGitMBean(workspace);
    $scope.configAdminMBean = Osgi.getHawtioConfigAdminMBean(workspace);
    $scope.hawtioConfigAdminMBean = $scope.configAdminMBean;
    $scope.defaultVersion = Fabric.isFMCContainer(workspace) ? Fabric.getDefaultVersionId(jolokia) : "1.0";
  }]);

}
