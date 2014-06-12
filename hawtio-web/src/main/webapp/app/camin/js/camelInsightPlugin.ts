/**
 * Camel Insight Plugin
 *
 * @module Camin
 * @main Camin
 */
module Camin {
  var pluginName = 'camin';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
      when('/camin', {templateUrl: 'app/camin/html/camin.html'}).
      when('/camin/:exchangeId', {templateUrl: 'app/camin/html/camin.html'})
  }]);

  _module.run(["workspace", "viewRegistry", "helpRegistry", (workspace:Workspace, viewRegistry, helpRegistry) => {

    viewRegistry["camin"] = "app/camin/html/layoutCamin.html";
    helpRegistry.addUserDoc('camin', 'app/camin/doc/help.md', () => {
      return Fabric.hasFabric(workspace);
    });

    workspace.topLevelTabs.push( {
      id: "camin",
      content: "Camel",
      title: "Insight into Camel",
      isValid: (workspace) => Fabric.hasFabric(workspace),
      href: () => "#/camin",
      isActive: (workspace: Workspace) => workspace.isLinkActive("camin")
    });

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
