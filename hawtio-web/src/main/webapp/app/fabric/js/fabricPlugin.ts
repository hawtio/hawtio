module Fabric {

  export var jmxDomain = 'org.fusesource.fabric';

  export var templatePath = 'app/fabric/html/';


  angular.module('fabric', ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ngResource', 'ngGrid', 'hawtio-forms', 'hawtioCore', 'ngDragDrop', 'wiki']).config(($routeProvider) => {
    $routeProvider.
            when('/createFabric', {templateUrl: templatePath + 'createFabric.html'}).
            when('/fabric/containers/createContainer', {templateUrl: templatePath + 'createContainer.html' , reloadOnSearch: false }).
            when('/fabric/map', {templateUrl: templatePath + 'map.html'}).
            when('/fabric/clusters/*page', {templateUrl: templatePath + 'clusters.html'}).
            when('/fabric/containers', {templateUrl: templatePath + 'containers.html'}).
            when('/fabric/container/:containerId', {templateUrl: templatePath + 'container.html'}).
            when('/fabric/profile/:versionId/:profileId', {templateUrl: templatePath + 'profile.html'}).
            when('/fabric/profile/:versionId/:profileId/editFeatures', {templateUrl: templatePath + 'editFeatures.html'}).
            when('/fabric/profile/:versionId/:profileId/:fname', {templateUrl: templatePath + 'pid.html'}).
            when('/fabric/view', { templateUrl: templatePath + 'fabricView.html', reloadOnSearch: false }).
            when('/fabric/patching', { templateUrl: templatePath + 'patching.html' }).
            when('/fabric/test', { templateUrl: templatePath + 'test.html' });
  }).

    directive('fabricVersionSelector', function() {
      return new Fabric.VersionSelector();
    }).
    directive('fabricProfileSelector', function() {
      return new Fabric.ProfileSelector();
    }).
    directive('fabricContainerList', () => {
      return new Fabric.ContainerList();
    }).
    directive('fabricProfileDetails', () => {
        return new Fabric.ProfileDetails();
    }).

          run(($location: ng.ILocationService, workspace: Workspace, jolokia, viewRegistry, pageTitle:Core.PageTitle, helpRegistry) => {

            viewRegistry['fabric'] = templatePath + 'layoutFabric.html';

            pageTitle.addTitleElement( ():string => {
              var id = '';
              try {
                id = jolokia.getAttribute(Fabric.managerMBean, 'CurrentContainerName', {timeout: 1});
              } catch (e) {
                // ignore
              }
              return id;
            });

            workspace.topLevelTabs.push( {
              content: "Create Fabric",
              title: "Create a fabric starting with this container",
              isValid: (workspace) => !Fabric.hasFabric(workspace),
              href: () => "#/createFabric",
              isActive: (workspace) => workspace.isLinkActive("createFabric")
            });
            workspace.topLevelTabs.push( {
              content: "Runtime",
              title: "Manage your containers in this fabric",
              isValid: (workspace) => Fabric.hasFabric(workspace),
              href: () => "#/fabric/containers",
              isActive: (workspace: Workspace) => workspace.isLinkActive("fabric")
            });
            workspace.topLevelTabs.push( {
              content: "Configuration",
              title: "Manage the configuration of your profiles in Fabric",
              isValid: (workspace) => Fabric.hasFabric(workspace),
              href: () => {
                return "#/wiki/branch/" + Fabric.activeVersion($location) + "/view/fabric/profiles";
              },
              isActive: (workspace: Workspace) => workspace.isLinkActive("wiki")
            });

            helpRegistry.addDevDoc("fabric", 'app/fabric/doc/developer.md');

          });

  hawtioPluginLoader.addModule('fabric');
}
