module Osgi {
  var pluginName = 'osgi';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/osgi/bundles', {templateUrl: 'app/osgi/html/bundles.html', controller: BundleController})
  }).
          run((workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['osgi/bundles'] = () => true;

            workspace.topLevelTabs.push( {
              content: "OSGi",
              title: "Visualise and manage the bundles and services in this OSGi container",
              isValid: () => workspace.treeContainsDomainAndProperties("osgi.core"),
              href: () => url("#/osgi/bundles"),
              isActive: () => workspace.isLinkActive("osgi")
            });
/*
            we have a top level OSGi tab; lets not confuse things just yet with a nested OSGi tab too in the JMX view
            as it gets confusing as the OSGi tab can be used without a JMX selection

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Bundles',
              title: "View the available bundles in this OSGi container",
              isValid: () => workspace.isOsgiFolder(),
              href: () => "#/osgi/bundles"
            });
*/
          });

  hawtioPluginLoader.addModule(pluginName);
}
