module Osgi {
  var pluginName = 'osgi';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/osgi/bundles', {templateUrl: 'app/osgi/html/bundles.html'}).
            when('/osgi/bundle/:bundleId', {templateUrl: 'app/osgi/html/bundle.html'}).
            when('/osgi/services', {templateUrl: 'app/osgi/html/services.html'}).
            when('/osgi/packages', {templateUrl: 'app/osgi/html/packages.html'}).
            when('/osgi/package/:package/:version', {templateUrl: 'app/osgi/html/package.html'}).
            when('/osgi/configurations', {templateUrl: 'app/osgi/html/configurations.html'}).
            when('/osgi/pid/:pid', {templateUrl: 'app/osgi/html/pid.html'})
  }).
          run((workspace:Workspace, viewRegistry) => {

            viewRegistry['osgi'] = "app/osgi/html/layoutOsgi.html";

            workspace.topLevelTabs.push( {
              content: "OSGi",
              title: "Visualise and manage the bundles and services in this OSGi container",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("osgi.core"),
              href: () => "#/osgi/bundles",
              isActive: (workspace: Workspace) => workspace.isLinkActive("osgi")
            });

      });

  hawtioPluginLoader.addModule(pluginName);
}
