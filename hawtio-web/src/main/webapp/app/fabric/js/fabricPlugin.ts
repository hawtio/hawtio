module Fabric {

  export var jmxDomain = 'org.fusesource.fabric';

  export var templatePath = 'app/fabric/html/';


  angular.module('fabric', ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ngResource', 'ngGrid', 'hawtio-forms', 'hawtioCore', 'ngDragDrop', 'wiki']).config(($routeProvider) => {
    $routeProvider.
            when('/fabric/create', {templateUrl: templatePath + 'createFabric.html'}).
            when('/fabric/containers/createContainer', {templateUrl: templatePath + 'createContainer.html' , reloadOnSearch: false }).
            when('/fabric/map', {templateUrl: templatePath + 'map.html'}).
            when('/fabric/clusters/*page', {templateUrl: templatePath + 'clusters.html'}).
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
              content: "Fabric",
              title: "Manage your containers and middleware in a fabric",
              isValid: (workspace) => Fabric.hasFabric(workspace),
              href: () => "#/fabric/view",
              isActive: (workspace: Workspace) => workspace.isLinkActive("fabric")
            });

            helpRegistry.addDevDoc("fabric", 'app/fabric/doc/developer.md');

          });

  hawtioPluginLoader.addModule('fabric');
}
