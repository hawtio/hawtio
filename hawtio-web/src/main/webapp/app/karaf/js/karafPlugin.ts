module Karaf {
  var pluginName = 'karaf';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/karaf/features', {templateUrl: 'app/karaf/html/features.html'}).
            when('/karaf/feature/:name/:version', {templateUrl: 'app/karaf/html/feature.html'})
  }).
      run((workspace:Workspace, viewRegistry) => {

          viewRegistry['karaf'] = "app/karaf/html/layoutKaraf.html";

            workspace.topLevelTabs.push( {
              content: "Karaf",
              title: "Visualise and manage the bundles and services in this OSGi container",
              isValid: () => workspace.treeContainsDomainAndProperties("org.apache.karaf"),
              href: () => "#/karaf/features?tab=karafTab",
              isActive: () => workspace.isTopTabActive("karafTab")
            });

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Features',
              title: "View the available bundles in this OSGi container",
              isValid: () => workspace.isKarafFolder(),
              href: () => "#/karaf/features"
            });
      });

  hawtioPluginLoader.addModule(pluginName);
}
