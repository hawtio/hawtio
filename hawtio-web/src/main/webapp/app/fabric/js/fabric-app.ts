module Fabric {
  angular.module('fabric', ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/fabric/containers', {templateUrl: 'app/fabric/html/containers.html', controller: ContainersController}).
            when('/fabric/container/:containerId', {templateUrl: 'app/fabric/html/container.html', controller: ContainerController}).
            when('/fabric/profiles', {templateUrl: 'app/fabric/html/profiles.html', controller: ProfilesController}).
            when('/fabric/profile/:versionId/:profileId', {templateUrl: 'app/fabric/html/profile.html', controller: ProfileController})
  }).
          run(($location: ng.ILocationService, workspace: Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['/fabric/containers'] = () => workspace.hasFabricMBean();
            map['/fabric/profiles'] = () => workspace.hasFabricMBean();
            //map['/fabric/profile/:versionId/:profileId'] = () => workspace.hasFabricMBean();


            workspace.topLevelTabs.push( {
              content: "Fabric",
              title: "Manage your containers and middleware in a fabric",
              isValid: () => workspace.hasFabricMBean(),
              href: () => url("#/fabric/containers")
            });

          });

  hawtioPluginLoader.addModule('fabric');
}
