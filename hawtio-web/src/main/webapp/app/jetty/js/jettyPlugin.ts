module Jetty {
  var pluginName = 'jetty';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
      // TODO custom tomcat views go here...
  }).
          run(($location: ng.ILocationService, workspace:Workspace) => {

            workspace.topLevelTabs.push( {
              content: "Jetty",
              title: "Manage your Jetty container",
              isValid: () => workspace.treeContainsDomainAndProperties("org.eclipse.jetty.server"),
              href: () => "#/jmx/attributes?tab=jetty",
              isActive: () => workspace.isTopTabActive("jetty")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
