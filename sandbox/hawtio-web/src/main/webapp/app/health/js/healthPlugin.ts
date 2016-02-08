/**
 * @module Health
 * @main Health
 */
/// <reference path="healthHelpers.ts"/>
module Health {
  var pluginName = 'health';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'hawtio-ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/health', {templateUrl: 'app/health/html/health.html'})
  }]);

  _module.run(["$location", "workspace", "viewRegistry", "layoutFull", "helpRegistry", ($location: ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

    viewRegistry['health'] = layoutFull;

    helpRegistry.addUserDoc('health', 'app/health/doc/help.md', () => {
      return Health.hasHealthMBeans(workspace);
    });

    workspace.topLevelTabs.push( {
      id: "health",
      content: "Health",
      title: "View the health of the various sub systems",
      isValid: (workspace: Workspace) => Health.hasHealthMBeans(workspace),
      href: () => "#/health",
      isActive: (workspace: Workspace) => workspace.isTopTabActive("health")
    });

  }]);

  hawtioPluginLoader.addModule(pluginName);

}
