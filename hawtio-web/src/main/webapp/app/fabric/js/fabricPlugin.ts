module Fabric {
  export var jmxDomain = 'org.fusesource.fabric';

  angular.module('fabric', ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ngResource', 'ngGrid', 'hawtio-forms', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/fabric/containers', {templateUrl: 'app/fabric/html/containers.html'}).
            when('/fabric/createContainer', {templateUrl: 'app/fabric/html/createContainer.html'}).
            when('/fabric/map', {templateUrl: 'app/fabric/html/map.html'}).
            when('/fabric/clusters/*page', {templateUrl: 'app/fabric/html/clusters.html'}).
            when('/fabric/container/:containerId', {templateUrl: 'app/fabric/html/container.html'}).
            when('/fabric/profiles', {templateUrl: 'app/fabric/html/profiles.html'}).
            when('/fabric/profile/:versionId/:profileId', {templateUrl: 'app/fabric/html/profile.html'}).
            when('/fabric/profile/:versionId/:profileId/:fname', {templateUrl: 'app/fabric/html/pid.html'});
  }).
          run(($location: ng.ILocationService, workspace: Workspace, viewRegistry) => {

            viewRegistry['fabric'] = "app/fabric/html/layoutFabric.html";

            var isValid = (workspace) => {
              if (workspace.treeContainsDomainAndProperties(jmxDomain, {type: 'Fabric'})) {

                var status = workspace.jolokia.getAttribute(managerMBean, 'FabricServiceStatus');

                console.log("status:", status);

                if (status) {
                  return status.clientValid && status.clientConnected;
                } else {
                  return false;
                }
              }
              return false;
            }


            workspace.topLevelTabs.push( {
              content: "Fabric",
              title: "Manage your containers and middleware in a fabric",
              isValid: isValid,
              href: () => "#/fabric/containers",
              isActive: (workspace: Workspace) => workspace.isLinkActive("fabric")
            });

          });

  hawtioPluginLoader.addModule('fabric');
}
