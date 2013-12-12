/**
 * @module Osgi
 * @main Osgi
 */
module Osgi {
  var pluginName = 'osgi';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'hawtioCore', 'hawtio-ui']).config(($routeProvider) => {
    $routeProvider.
            when('/osgi/bundle-list', {templateUrl: 'app/osgi/html/bundle-list.html'}).
            when('/osgi/bundles', {templateUrl: 'app/osgi/html/bundles.html'}).
            when('/osgi/bundle/:bundleId', {templateUrl: 'app/osgi/html/bundle.html'}).
            when('/osgi/services', {templateUrl: 'app/osgi/html/services.html'}).
            when('/osgi/packages', {templateUrl: 'app/osgi/html/packages.html'}).
            when('/osgi/package/:package/:version', {templateUrl: 'app/osgi/html/package.html'}).
            when('/osgi/configurations', {templateUrl: 'app/osgi/html/configurations.html'}).
            when('/osgi/pid/:pid', {templateUrl: 'app/osgi/html/pid.html'}).
            when('/osgi/fwk', {templateUrl: 'app/osgi/html/framework.html'}).
            when('/osgi/dependencies', {templateUrl: 'app/osgi/html/svc-dependencies.html', reloadOnSearch: false })
  }).
          run((workspace:Workspace, viewRegistry, helpRegistry) => {

            viewRegistry['osgi'] = "app/osgi/html/layoutOsgi.html";
            helpRegistry.addUserDoc('osgi', 'app/osgi/doc/help.md', () => {
              return workspace.treeContainsDomainAndProperties("osgi.core");
            });

        workspace.topLevelTabs.push( {
              id: "osgi",
              content: "OSGi",
              title: "Visualise and manage the bundles and services in this OSGi container",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("osgi.core"),
              href: () => "#/osgi/bundle-list",
              isActive: (workspace: Workspace) => workspace.isLinkActive("osgi")
            });

      })
      .factory('osgiDataService', function (workspace: Workspace, jolokia) {
        return new OsgiDataService(workspace, jolokia);
      });

  hawtioPluginLoader.addModule(pluginName);
}
