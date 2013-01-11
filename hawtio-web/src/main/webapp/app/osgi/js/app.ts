module Osgi {
  angular.module('osgi', ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
            $routeProvider.
                    when('/bundles', {templateUrl: 'app/osgi/html/bundles.html', controller: BundleController})
          });
}