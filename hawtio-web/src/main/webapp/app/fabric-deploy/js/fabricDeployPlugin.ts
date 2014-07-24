/// <reference path="../../baseHelpers.ts"/>
/// <reference path="../../fabric/js/fabricPlugin.ts"/>
module FabricDeploy {

  export var log:Logging.Logger = Logger.get('FabricDeploy');
  export var pluginName = 'fabric-deploy';
  export var templatePath = 'app/fabric-deploy/html/';

  export var _module = angular.module(pluginName, ['bootstrap', 'fabric']);

  _module.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
      .when('/fabric/deploy', { templateUrl: templatePath + 'deploy.html' });
  }]);

  _module.run(['viewRegistry', 'layoutFull', 'workspace', (viewRegistry, layoutFull, workspace) => {

    viewRegistry['fabric/deploy'] = layoutFull;

    workspace.topLevelTabs.push({
      id: 'fabric.deploy',
      content: 'Deploy',
      title: 'Deploy artifacts to this fabric',
      isValid: (workspace) => Fabric.isFMCContainer(workspace),
      href: () => '#/fabric/deploy',
      isActive: (workspace:Workspace) => workspace.isLinkActive('fabric/deploy')
    });
  
    log.debug("started");
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
