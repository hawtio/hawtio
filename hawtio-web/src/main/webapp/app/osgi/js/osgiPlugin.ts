module Osgi {
  var pluginName = 'osgi';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
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
              href: () => "#/osgi/bundles?tab=osgiTab",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("osgiTab")
            });

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Bundles',
              title: "View the available bundles in this OSGi container",
              isValid: (workspace: Workspace) => workspace.isOsgiFolder(),
              href: () => "#/osgi/bundles"
            });

            workspace.subLevelTabs.push({
              content: '<i class="icon-list"></i> Packages',
              title: "View the available packages in this OSGi container",
              isValid: (workspace: Workspace) => workspace.isOsgiFolder(),
              href: () => "#/osgi/packages"
            });

            workspace.subLevelTabs.push({
                  content: '<i class="icon-list"></i> Services',
                  title: "View the available services in this OSGi container",
                  isValid: (workspace: Workspace) => workspace.isOsgiFolder(),
                  href: () => "#/osgi/services"
              });

          workspace.subLevelTabs.push({
              content: '<i class="icon-list"></i> Configuration',
              title: "View the available configuration in this OSGi container",
              isValid: (workspace: Workspace) => workspace.isOsgiCompendiumFolder(),
              href: () => "#/osgi/configurations"
          });

      });

  hawtioPluginLoader.addModule(pluginName);
}
