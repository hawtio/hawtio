module OpenEJB {
  var pluginName = 'openejb';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
      // TODO custom tomcat views go here...
  }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry) => {

            viewRegistry['openojb'] = "app/openejb/html/layoutOpenEJBTree.html";

            workspace.topLevelTabs.push( {
              content: "OpenEJB",
              title: "Manage your OpenEJB resources",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("openejb"),
              href: () => "#/jmx/attributes?tab=openejb",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("openejb")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
