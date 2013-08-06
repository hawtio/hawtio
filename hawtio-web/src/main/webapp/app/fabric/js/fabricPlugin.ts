module Fabric {

  export var jmxDomain = 'org.fusesource.fabric';

  export var templatePath = 'app/fabric/html/';


  angular.module('fabric', ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ngResource', 'ngGrid', 'hawtio-forms', 'hawtioCore', 'ngDragDrop']).config(($routeProvider) => {
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

          run(($location: ng.ILocationService, workspace: Workspace, jolokia, viewRegistry, pageTitle:Core.PageTitle) => {

            Fabric.schemaConfigure();

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
              isValid: workspace.treeContainsDomainAndProperties(jmxDomain, {type: 'Fabric'}),
              href: () => "#/fabric/view",
              isActive: (workspace: Workspace) => workspace.isLinkActive("fabric")
            });

          });

  hawtioPluginLoader.addModule('fabric');
}
