module Osgi {
  var pluginName = 'osgi';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/osgi/bundles', {templateUrl: 'app/osgi/html/bundles.html', controller: BundlesController}).
            when('/osgi/bundle/:bundleId', {templateUrl: 'app/osgi/html/bundle.html', controller: BundleController}).
            when('/osgi/services', {templateUrl: 'app/osgi/html/services.html', controller: ServiceController}).
            when('/osgi/packages', {templateUrl: 'app/osgi/html/packages.html', controller: PackagesController}).
            when('/osgi/package/:package/:version', {templateUrl: 'app/osgi/html/package.html', controller: PackageController}).
            when('/osgi/configurations', {templateUrl: 'app/osgi/html/configurations.html', controller: ConfigurationsController}).
            when('/osgi/pid/:pid', {templateUrl: 'app/osgi/html/pid.html', controller: PidController})
  }).
          run((workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['osgi/bundles'] = () => workspace.treeContainsDomainAndProperties("osgi.core");
            map['osgi/packages'] = () => workspace.treeContainsDomainAndProperties("osgi.core");
            map['osgi/services'] = () => workspace.treeContainsDomainAndProperties("osgi.core");
            map['osgi/configurations'] = () => workspace.treeContainsDomainAndProperties("osgi.compendium");

            workspace.topLevelTabs.push( {
              content: "OSGi",
              title: "Visualise and manage the bundles and services in this OSGi container",
              isValid: () => workspace.treeContainsDomainAndProperties("osgi.core"),
              href: () => "#/osgi/bundles?tab=osgiTab",
              isActive: () => workspace.isTopTabActive("osgiTab")
            });

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Bundles',
              title: "View the available bundles in this OSGi container",
              isValid: () => workspace.isOsgiFolder(),
              href: () => "#/osgi/bundles"
            });

            workspace.subLevelTabs.push({
              content: '<i class="icon-list"></i> Packages',
              title: "View the available packages in this OSGi container",
              isValid: () => workspace.isOsgiFolder(),
              href: () => "#/osgi/packages"
            });

            workspace.subLevelTabs.push({
                  content: '<i class="icon-list"></i> Services',
                  title: "View the available services in this OSGi container",
                  isValid: () => workspace.isOsgiFolder(),
                  href: () => "#/osgi/services"
              });

          workspace.subLevelTabs.push({
              content: '<i class="icon-list"></i> Configuration',
              title: "View the available configuration in this OSGi container",
              isValid: () => workspace.isOsgiCompendiumFolder(),
              href: () => "#/osgi/configurations"
          });

      });

  hawtioPluginLoader.addModule(pluginName);
}
