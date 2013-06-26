module Fabric {

  export var jmxDomain = 'org.fusesource.fabric';

  export var templatePath = 'app/fabric/html/';


  angular.module('fabric', ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ngResource', 'ngGrid', 'hawtio-forms', 'hawtioCore', 'ngDragDrop']).config(($routeProvider) => {
    $routeProvider.
            when('/fabric/containers/createContainer', {templateUrl: templatePath + 'createContainer.html' , reloadOnSearch: false }).
            when('/fabric/map', {templateUrl: templatePath + 'map.html'}).
            when('/fabric/clusters/*page', {templateUrl: templatePath + 'clusters.html'}).
            when('/fabric/container/:containerId', {templateUrl: templatePath + 'container.html'}).
            when('/fabric/profile/:versionId/:profileId', {templateUrl: templatePath + 'profile.html'}).
            when('/fabric/profile/:versionId/:profileId/editFeatures', {templateUrl: templatePath + 'editFeatures.html'}).
            when('/fabric/profile/:versionId/:profileId/:fname', {templateUrl: templatePath + 'pid.html'}).
            when('/fabric/view', { templateUrl: templatePath + 'fabricView.html', reloadOnSearch: false }).
            when('/fabric/patching', { templateUrl: templatePath + 'patching.html' });
  }).
    directive('fabricVersionSelector', function() {
      return new Fabric.VersionSelector();
    }).

          run(($location: ng.ILocationService, workspace: Workspace, jolokia, viewRegistry, pageTitle) => {

            viewRegistry['fabric'] = templatePath + 'layoutFabric.html';

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
