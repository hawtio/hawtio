module Osgi {
  var pluginName = 'osgi';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/osgi/bundles', {templateUrl: 'app/osgi/html/bundles.html', controller: BundlesController}).
            when('/osgi/bundle/:bundleId', {templateUrl: 'app/osgi/html/bundle.html', controller: BundleController}).
            when('/osgi/services', {templateUrl: 'app/osgi/html/services.html', controller: ServiceController})
  }).
          run((workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['osgi/bundles'] = () => workspace.treeContainsDomainAndProperties("osgi.core");
            map['osgi/services'] = () => workspace.treeContainsDomainAndProperties("osgi.core");

            workspace.topLevelTabs.push( {
              content: "OSGi",
              title: "Visualise and manage the bundles and services in this OSGi container",
              isValid: () => workspace.treeContainsDomainAndProperties("osgi.core"),
              href: () => url("#/osgi/bundles?tab=osgiTab"),
              isActive: () => workspace.isTopTabActive("osgiTab")
            });

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Bundles',
              title: "View the available bundles in this OSGi container",
              isValid: () => workspace.isOsgiFolder(),
              href: () => "#/osgi/bundles"
            });


              workspace.subLevelTabs.push({
                  content: '<i class="icon-list"></i> Services',
                  title: "View the available services in this OSGi container",
                  isValid: () => workspace.isOsgiFolder(),
                  href: () => "#/osgi/services"
              });

          });

  hawtioPluginLoader.addModule(pluginName);
}
