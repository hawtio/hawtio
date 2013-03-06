module Jetty {
  var pluginName = 'jetty';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
      config(($routeProvider) => {
        $routeProvider.
          when('/jetty/server', {templateUrl: 'app/jetty/html/server.html'}).
          when('/jetty/applications', {templateUrl: 'app/jetty/html/applications.html'}).
          when('/jetty/connectors', {templateUrl: 'app/jetty/html/connectors.html'}).
          when('/jetty/mbeans', {templateUrl: 'app/jetty/html/mbeans.html'});
      }).
        filter('jettyIconClass', () => iconClass).
        run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {

            viewRegistry['jetty'] = "app/jetty/html/layoutJettyTabs.html";
            viewRegistry['jettyTree'] = "app/jetty/html/layoutJettyTree.html";

            workspace.topLevelTabs.push( {
                content: "Jetty",
                title: "Manage your Jetty container",
                isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("org.eclipse.jetty.server"),
                href: () => "#/jetty/applications",
                isActive: (workspace: Workspace) => workspace.isTopTabActive("jetty")
            });

        });

  hawtioPluginLoader.addModule(pluginName);
}
