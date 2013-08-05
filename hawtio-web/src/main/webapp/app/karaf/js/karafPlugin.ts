module Karaf {
  var pluginName = 'karaf';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/karaf/server', {templateUrl: 'app/karaf/html/server.html'}).
            when('/karaf/features', {templateUrl: 'app/karaf/html/features.html'}).
            when('/karaf/scr', {templateUrl: 'app/karaf/html/scr.html'}).
            when('/karaf/feature/:name/:version', {templateUrl: 'app/karaf/html/feature.html'})
  }).
      run((workspace:Workspace, viewRegistry) => {

          viewRegistry['karaf'] = "app/karaf/html/layoutKaraf.html";

            workspace.topLevelTabs.push( {
              content: "Karaf",
              title: "Visualise and manage the bundles and services in this OSGi container",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("org.apache.karaf"),
              href: () => "#/karaf/server?tab=karafTab",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("karafTab")
            });

/*
            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Server',
              title: "View information about this OSGi container",
              isValid: (workspace: Workspace) => workspace.isKarafFolder(),
              href: () => "#/karaf/server"
            });

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Features',
              title: "View the available bundles in this OSGi container",
              isValid: (workspace: Workspace) => getSelectionFeaturesMBean(workspace),
              href: () => "#/karaf/features"
            });
*/
      });

  hawtioPluginLoader.addModule(pluginName);
}
