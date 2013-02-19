module Jetty {
  var pluginName = 'jetty';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {

      $routeProvider.when('/jettyConsole',
          {templateUrl: 'app/jetty/html/jettyConsole.html',controller: JettyConsoleController}
      );

    }).run(($location: ng.ILocationService, workspace:Workspace, viewRegistry) => {

      viewRegistry['jetty'] = "app/jetty/html/layoutJettyConsole.html";

      workspace.topLevelTabs.push( {
        content: "Jetty",
        title: "Jetty Console",
        isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("org.eclipse.jetty.server"),
        href: () => "#/jettyConsole",
        isActive: (workspace: Workspace) => workspace.isTopTabActive("jetty")
      });

    });

  hawtioPluginLoader.addModule(pluginName);
}
