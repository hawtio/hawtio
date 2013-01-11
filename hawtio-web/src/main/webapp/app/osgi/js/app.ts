module Osgi {
  angular.module('osgi', ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/bundles', {templateUrl: 'app/osgi/html/bundles.html', controller: BundleController})
  }).
          run((workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['bundles'] = () => workspace.isOsgiFolder();
          });
}