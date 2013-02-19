module JBoss {
  var pluginName = 'jboss';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
      // TODO custom tomcat views go here...
  }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry) => {

            viewRegistry['jboss'] = "app/jboss/html/layoutJBossTree.html";

            workspace.topLevelTabs.push( {
              content: "JBoss",
              title: "Manage your JBoss container",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("jboss.as") ||
                      workspace.treeContainsDomainAndProperties("jboss.jta") ||
                      workspace.treeContainsDomainAndProperties("jboss.modules"),
              href: () => "#/jmx/attributes?tab=jboss",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("jboss")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
