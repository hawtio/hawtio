module Fabric {
  angular.module('fabric', ['bootstrap', 'ngResource', 'ngGrid', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/fabric/containers', {templateUrl: 'app/fabric/html/containers.html'}).
            when('/fabric/container/:containerId', {templateUrl: 'app/fabric/html/container.html'}).
            when('/fabric/profiles', {templateUrl: 'app/fabric/html/profiles.html'}).
            when('/fabric/profile/:versionId/:profileId', {templateUrl: 'app/fabric/html/profile.html'}).
            when('/fabric/profile/:versionId/:profileId/:fname', {templateUrl: 'app/fabric/html/pid.html'});
  }).
          run(($location: ng.ILocationService, workspace: Workspace, viewRegistry) => {

            viewRegistry['fabric'] = "app/fabric/html/layoutFabric.html";

            workspace.topLevelTabs.push( {
              content: "Fabric",
              title: "Manage your containers and middleware in a fabric",
              isValid: () => workspace.treeContainsDomainAndProperties('org.fusesource.fabric', {type: 'Fabric'}),
              href: () => "#/fabric/containers",
              isActive: () => workspace.isLinkActive("fabric")
            });

          });

  hawtioPluginLoader.addModule('fabric');
}
