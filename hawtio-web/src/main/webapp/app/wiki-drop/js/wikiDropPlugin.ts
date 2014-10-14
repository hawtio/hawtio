/// <reference path="../../baseHelpers.ts"/>
/// <reference path="../../fabric/js/fabricPlugin.ts"/>
module WikiDrop {

  export var log:Logging.Logger = Logger.get('WikiDrop');
  export var pluginName = 'wiki-drop';
  export var templatePath = 'app/' + pluginName + '/html/';

  export var _module = angular.module(pluginName, ['bootstrap', 'wiki']);

  _module.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
      .when('/wiki/drop', { templateUrl: templatePath + 'deploy.html' });
  }]);

  _module.run(['viewRegistry', 'layoutFull', 'workspace', (viewRegistry, layoutFull, workspace) => {

    //viewRegistry['fabric/deploy'] = layoutFull;

    /*
    workspace.topLevelTabs.push({
      id: 'fabric.deploy',
      content: 'Deploy',
      title: 'Deploy artifacts to this fabric',
      isValid: (workspace) => Fabric.isFMCContainer(workspace),
      href: () => '#/fabric/deploy',
      isActive: (workspace:Workspace) => workspace.isLinkActive('fabric/deploy')
    });
    */
  
    log.debug("started");
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
