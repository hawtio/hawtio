module Fabric {
  angular.module('fabric', ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/fabric/containers', {templateUrl: 'app/fabric/html/containers.html', controller: ContainersController}).
            when('/fabric/profiles', {templateUrl: 'app/fabric/html/profiles.html', controller: ProfilesController})
  }).
          run((workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['/fabric/containers'] = () => workspace.hasFabricMBean();
            map['/fabric/profiles'] = () => workspace.hasFabricMBean();
          });
}
