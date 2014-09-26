/**
 * @module OpenEJB
 * @main OpenEJB
 */
module OpenEJB {
  var pluginName = 'openejb';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']);
  
  _module.config(["$routeProvider", ($routeProvider) => {
      // TODO custom openejb views go here...
  }]);

  _module.run(["$location", "workspace", "viewRegistry", "helpRegistry", ($location: ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

    viewRegistry['openojb'] = "app/openejb/html/layoutOpenEJBTree.html";
    helpRegistry.addUserDoc('openejb', 'app/openejb/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties("openejb");
    });

    workspace.topLevelTabs.push( {
      id: "openejb",
      content: "OpenEJB",
      title: "Manage your OpenEJB resources",
      isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("openejb"),
      href: () => "#/jmx/attributes?tab=openejb",
      isActive: (workspace: Workspace) => workspace.isTopTabActive("openejb")
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
