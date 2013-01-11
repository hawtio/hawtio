module Fabric {
  angular.module('fabric', ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
            $routeProvider.
                    when('/fabric/containers', {templateUrl: 'app/fabric/html/containers.html', controller: ContainersController}).
                    when('/fabric/profiles', {templateUrl: 'app/fabric/html/profiles.html', controller: ProfilesController})
          });
}
