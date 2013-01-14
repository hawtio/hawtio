module Osgi {
  var pluginName = 'osgi';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/bundles', {templateUrl: 'app/osgi/html/bundles.html', controller: BundleController})
  }).
          run((workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['bundles'] = () => workspace.isOsgiFolder();

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Bundles',
              title: "View the available bundles in this OSGi container",
              isValid: () => workspace.isOsgiFolder(),
              href: () => "#/bundles"
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
