module Fabric {
  export var jmxDomain = 'org.fusesource.fabric';

  angular.module('fabric', ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ngResource', 'ngGrid', 'hawtio-forms', 'hawtioCore', 'ngDragDrop']).config(($routeProvider) => {
    $routeProvider.
            when('/fabric/containers/createContainer', {templateUrl: 'app/fabric/html/createContainer.html' , reloadOnSearch: false }).
            when('/fabric/map', {templateUrl: 'app/fabric/html/map.html'}).
            when('/fabric/clusters/*page', {templateUrl: 'app/fabric/html/clusters.html'}).
            when('/fabric/container/:containerId', {templateUrl: 'app/fabric/html/container.html'}).
            when('/fabric/profile/:versionId/:profileId', {templateUrl: 'app/fabric/html/profile.html'}).
            when('/fabric/profile/:versionId/:profileId/editFeatures', {templateUrl: 'app/fabric/html/editFeatures.html'}).
            when('/fabric/profile/:versionId/:profileId/:fname', {templateUrl: 'app/fabric/html/pid.html'}).
            when('/fabric/view', { templateUrl: 'app/fabric/html/fabricView.html', reloadOnSearch: false }).
            when('/fabric/patching', { templateUrl: 'app/fabric/html/patching.html' });
  }).
          run(($location: ng.ILocationService, workspace: Workspace, jolokia, viewRegistry, pageTitle) => {

            viewRegistry['fabric'] = "app/fabric/html/layoutFabric.html";

            try {
              var id = jolokia.getAttribute('org.fusesource.fabric:type=Fabric', 'CurrentContainerName', {timeout: 1});
              if (id) {
                pageTitle.push(id);
              }
            } catch (e) {
              // ignore
            }

            var isValid = (workspace) => {
              if (workspace.treeContainsDomainAndProperties(jmxDomain, {type: 'Fabric'})) {
                try {
                  var status = workspace.jolokia.getAttribute(managerMBean, 'FabricServiceStatus', {timeout: 1});
                  if (status) {
                    return status.clientValid && status.clientConnected;
                  }
                } catch (e) {
                  // ignore this
                }
              }
              return false;
            };


            workspace.topLevelTabs.push( {
              content: "Fabric",
              title: "Manage your containers and middleware in a fabric",
              isValid: isValid,
              href: () => "#/fabric/view",
              isActive: (workspace: Workspace) => workspace.isLinkActive("fabric")
            });

          });

  hawtioPluginLoader.addModule('fabric');
}
