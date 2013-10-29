module JBoss {
  var pluginName = 'jboss';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'ui.bootstrap.dialog', 'hawtioCore']).
    config(($routeProvider) => {
      $routeProvider.
            when('/jboss/server', {templateUrl: 'app/jboss/html/server.html'}).
            when('/jboss/applications', {templateUrl: 'app/jboss/html/applications.html'}).
            when('/jboss/dmr', {templateUrl: 'app/jboss/html/dmr.html'}).
            when('/jboss/connectors', {templateUrl: 'app/jboss/html/connectors.html'}).
            when('/jboss/mbeans', {templateUrl: 'app/jboss/html/mbeans.html'});
          }).
          filter('jbossIconClass', () => iconClass).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

            viewRegistry['jboss'] = "app/jboss/html/layoutJBossTabs.html";
            viewRegistry['jbossTree'] = "app/jboss/html/layoutJBossTree.html";
            helpRegistry.addUserDoc(pluginName, 'app/' + pluginName + '/doc/help.md', () => {
              return workspace.treeContainsDomainAndProperties("jboss.as") ||
                    workspace.treeContainsDomainAndProperties("jboss.jta") ||
                    workspace.treeContainsDomainAndProperties("jboss.modules");
            });

            workspace.topLevelTabs.push( {
              content: "JBoss",
              title: "Manage your JBoss container",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("jboss.as") ||
                      workspace.treeContainsDomainAndProperties("jboss.jta") ||
                      workspace.treeContainsDomainAndProperties("jboss.modules"),
              href: () => "#/jboss/applications",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("jboss")
            });

      });

  hawtioPluginLoader.addModule(pluginName);
}
