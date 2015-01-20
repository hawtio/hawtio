/// <reference path="../../helpers/js/pluginHelpers.ts"/>
/// <reference path="../../fabric/js/fabricPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="../../fabric/js/profileView.ts"/>
module FabricRequirements {

  export var requirementsContext = '/fabric/requirements';
  export var requirementsHash = '#' + requirementsContext;
  export var pluginName = "FabricRequirements";
  export var templatePath = 'app/fabric-requirements/html/';
  export var log:Logging.Logger = Logger.get(pluginName);
  export var _module = angular.module(pluginName, ['hawtioCore', 'fabric']);

  // little shortcut function we can easily prefix all of the controllers in this module
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);
  var fabricRoute = PluginHelpers.createRoutingFunction('app/fabric/html/');

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(UrlHelpers.join(requirementsContext, 'profile'), route('profileRequirements.html'))
                  .when(UrlHelpers.join(requirementsContext, 'sshConfig'), route('sshConfig.html'))
                  .when(UrlHelpers.join(requirementsContext, 'dockerConfig'), route('dockerConfig.html'))
                  .when(UrlHelpers.join(requirementsContext, 'status'), fabricRoute('activeProfiles.html'));
  }]);

  _module.run(['viewRegistry', 'layoutFull', 'workspace', 'ProfileViewActions', '$location', '$rootScope', (viewRegistry, layoutFull, workspace:Core.Workspace, ProfileViewActions:Fabric.ProfileViewActions, $location, $rootScope) => {
    viewRegistry['fabric/requirements'] = templatePath + 'layout.html';

    workspace.topLevelTabs.push({
      id: 'fabric.requirements',
      content: 'Scaling',
      isValid: (workspace:Core.Workspace) => Fabric.isFMCContainer(workspace),
      isActive: (workspace:Core.Workspace) => workspace.isLinkActive('fabric/requirements'),
      href: () => '#/fabric/requirements/profile'
    });

    ProfileViewActions['Add Requirements'] = <Fabric.ProfileViewAction>{
      index: 3,
      icon: 'icon-cog',
      buttonClass: 'btn-primary',
      objectName: Fabric.managerMBean,
      methodName: 'requirementsJson',
      title: 'Create requirements for the selected profiles',
      action: () => {
        $location.path('/fabric/requirements/profile');
        Core.$apply($rootScope);
      }
    };

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
