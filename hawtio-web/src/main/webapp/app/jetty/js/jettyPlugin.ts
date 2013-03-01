module Jetty {
  var pluginName = 'jetty';
    angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
        $routeProvider.
            when('/jetty', {templateUrl: 'app/jetty/html/jetty.html'})
    }).
        run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {

            viewRegistry['jetty'] = layoutFull;

            workspace.topLevelTabs.push( {
                content: "Jetty",
                title: "Jetty Console",
                isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("org.eclipse.jetty.server"),
                href: () => "#/jetty",
                isActive: (workspace: Workspace) => workspace.isTopTabActive("jetty")
            });

        });

  hawtioPluginLoader.addModule(pluginName);
}
