module JBoss {
  var pluginName = 'jboss';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
      $routeProvider.
          when('/jboss', {templateUrl: 'app/jboss/html/jboss.html'})
  }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {

          viewRegistry['jboss'] = layoutFull;

            workspace.topLevelTabs.push( {
              content: "JBoss",
              title: "Manage your JBoss container",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("jboss.as") ||
                      workspace.treeContainsDomainAndProperties("jboss.jta") ||
                      workspace.treeContainsDomainAndProperties("jboss.modules"),
              href: () => "#/jboss",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("jboss")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
