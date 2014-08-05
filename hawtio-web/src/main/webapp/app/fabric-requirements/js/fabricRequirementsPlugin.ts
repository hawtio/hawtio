/// <reference path="../../helpers/js/pluginHelpers.ts"/>
/// <reference path="../../fabric/js/fabricPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
module FabricRequirements {

  export var requirementsContext = '/fabric/requirements';
  export var requirementsHash = '#' + requirementsContext;
  export var pluginName = "FabricRequirements";
  export var templatePath = 'app/fabric-requirements/html/';
  export var log:Logging.Logger = Logger.get(pluginName);
  export var _module = angular.module(pluginName, ["hawtioCore"]);

  // little shortcut function we can easily prefix all of the controllers in this module
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(UrlHelpers.join(requirementsContext, 'profile'), route('profileRequirements.html'))
                  .when(UrlHelpers.join(requirementsContext, 'sshConfig'), route('sshConfig.html'))
                  .when(UrlHelpers.join(requirementsContext, 'dockerConfig'), route('dockerConfig.html'));
  }]);

  _module.run(['viewRegistry', 'layoutFull', 'workspace', (viewRegistry, layoutFull, workspace:Core.Workspace) => {
    viewRegistry['fabric/requirements'] = templatePath + 'layout.html';

    workspace.topLevelTabs.push({
      id: 'fabric.requirements',
      content: 'Scaling',
      isValid: (workspace:Core.Workspace) => Fabric.isFMCContainer(workspace),
      isActive: (workspace:Core.Workspace) => workspace.isLinkActive('fabric/requirements'),
      href: () => '#/fabric/requirements/profile'
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
