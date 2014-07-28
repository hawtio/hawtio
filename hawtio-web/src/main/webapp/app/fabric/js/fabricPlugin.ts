/**
 * @module Fabric
 * @main Fabric
 */
/// <reference path="../../core/js/corePlugin.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../perspective/js/perspectiveHelpers.ts"/>
/// <reference path="../../perspective/js/metadata.ts"/>
/// <reference path="../../insight/js/insightHelpers.ts"/>
/// <reference path="fabricHelpers.ts"/>
/// <reference path="fabricDialogs.ts"/>
/// <reference path="./iconRegistry.ts"/>
/// <reference path="../../wiki/js/wikiPlugin.ts"/>
module Fabric {

  export var templatePath = 'app/fabric/html/';
  export var activeMQTemplatePath = 'app/activemq/html/';

  export var _module = angular.module('fabric', ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ngResource', 'ngGrid', 'hawtio-forms', 'hawtioCore', 'ngDragDrop', 'wiki']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/fabric/containers/createContainer', {templateUrl: templatePath + 'createContainer.html', reloadOnSearch: false }).
            when('/fabric/map', {templateUrl: templatePath + 'map.html'}).
            when('/fabric/clusters/*page', {templateUrl: templatePath + 'clusters.html'}).
            when('/fabric/containers', {templateUrl: templatePath + 'containers.html', reloadOnSearch: false}).
            when('/fabric/container/:containerId', {templateUrl: templatePath + 'container.html', reloadOnSearch: false}).
            when('/fabric/assignProfile', {templateUrl: templatePath + 'assignProfile.html'}).
            when('/fabric/activeProfiles', {templateUrl: templatePath + 'activeProfiles.html'}).
            //when('/fabric/profile/:versionId/:profileId', {templateUrl: templatePath + 'profile.html'}).
            when('/wiki/profile/:versionId/:profileId/editFeatures', {templateUrl: templatePath + 'editFeatures.html'}).
            when('/fabric/profile/:versionId/:profileId/:fname', {templateUrl: templatePath + 'pid.html'}).
            when('/fabric/migrate', { templateUrl: templatePath + 'migrateVersions.html' }).
            when('/fabric/patching', { templateUrl: templatePath + 'patching.html' }).
            when('/fabric/configurations/:versionId/:profileId', { templateUrl: 'app/osgi/html/configurations.html' }).
            when('/fabric/configuration/:versionId/:profileId/:pid', { templateUrl: 'app/osgi/html/pid.html' }).
            when('/fabric/configuration/:versionId/:profileId/:pid/:factoryPid', { templateUrl: 'app/osgi/html/pid.html' }).
            when('/fabric/mq/brokers', { templateUrl: templatePath + 'brokers.html' }).
            when('/fabric/mq/brokerDiagram', { templateUrl: activeMQTemplatePath + 'brokerDiagram.html', reloadOnSearch: false }).
            when('/fabric/mq/brokerNetwork', { templateUrl: templatePath + 'brokerNetwork.html' }).
            when('/fabric/mq/createBroker', { templateUrl: templatePath + 'createBroker.html' }).
            when('/fabric/camel/diagram', { templateUrl: 'app/camel/html/fabricDiagram.html', reloadOnSearch: false }).
            when('/fabric/api', { templateUrl: templatePath + 'apis.html' }).

            // expose the API pages within the fabric namespace
            when('/fabric/api/wsdl', {templateUrl: 'app/api/html/wsdl.html'}).
            when('/fabric/api/wadl', {templateUrl: 'app/api/html/wadl.html'}).

            when('/fabric/test', { templateUrl: templatePath + 'test.html' }).
            when('/fabric/profileView', { templateUrl: templatePath + 'profileView.html', reloadOnSearch: false }).
            when('/fabric/containerView', { templateUrl: templatePath + 'containerView.html', reloadOnSearch: false });

  }]);


  _module.factory('serviceIconRegistry', () => {
    return Fabric.serviceIconRegistry;
  });
  _module.factory('containerIconRegistry', () => {
    return Fabric.containerIconRegistry;
  });

  _module.run(["$location", "workspace", "jolokia", "viewRegistry", "pageTitle", "helpRegistry", "$rootScope", "postLoginTasks", "preferencesRegistry", "wikiBranchMenu", "$dialog", "layoutFull", ($location: ng.ILocationService,
               workspace: Workspace,
               jolokia,
               viewRegistry,
               pageTitle:Core.PageTitle,
               helpRegistry,
               $rootScope,
               postLoginTasks:Core.Tasks,
               preferencesRegistry,
               wikiBranchMenu:Wiki.BranchMenu,
               $dialog, layoutFull) => {

    // let's not take up the whole /fabric with the fabric sub-tabs
    // other plugins might want to hang stuff off of /fabric
    viewRegistry['fabric/profileView'] = layoutFull;
    viewRegistry['fabric/containerView'] = layoutFull;
    viewRegistry['fabric/migrate'] = layoutFull;
    viewRegistry['fabric/patching'] = layoutFull;
    viewRegistry['fabric/container'] = layoutFull;
    viewRegistry['fabric/map'] = templatePath + 'layoutFabric.html';
    viewRegistry['fabric/clusters'] = templatePath + 'layoutFabric.html';
    viewRegistry['fabric/containers'] = templatePath + 'layoutFabric.html';
    viewRegistry['fabric/configurations'] = templatePath + 'layoutFabric.html';
    viewRegistry['fabric/configuration'] = templatePath + 'layoutFabric.html';
    viewRegistry['fabric/mq'] = templatePath + 'layoutFabric.html';
    viewRegistry['fabric/camel'] = templatePath + 'layoutFabric.html';
    viewRegistry['fabric/api'] = templatePath + 'layoutFabric.html';

    pageTitle.addTitleElement(() => {
      return Fabric.currentContainerId;
    });

    addWikiBranchMenuExtensions(wikiBranchMenu, $dialog, workspace);

    postLoginTasks.addTask('fabricFetchContainerName', () => {
      if (Fabric.currentContainerId === '' && Fabric.fabricCreated(workspace)) {
        jolokia.request({
          type: 'exec',
          mbean: Fabric.managerMBean,
          operation: 'currentContainer()',
          arguments: []
        }, onSuccess((response) => {
          if (!response.value) {
            return;
          }
          Fabric.currentContainer = response.value;
          Fabric.currentContainerId = currentContainer['id'];
          if ('container' in Perspective.metadata) {
            Core.pathSet(Perspective.metadata, ['container', 'label'], Fabric.currentContainerId);
            Core.pathSet(Perspective.metadata, ['container', 'icon'], Fabric.getTypeIcon(currentContainer));
          }
          Core.$apply($rootScope);
        }));
      }
    });

    preferencesRegistry.addTab("Fabric", "app/fabric/html/preferences.html", () => {
      return Fabric.isFMCContainer(workspace);
    });

    workspace.topLevelTabs.push({
      id: "fabric.runtime",
      content: "Runtime",
      title: "Manage your containers in this fabric",
      isValid: (workspace) => Fabric.isFMCContainer(workspace),
      href: () => "#/fabric/containers",
      isActive: (workspace: Workspace) => workspace.isLinkActive("fabric") 
                                       && !workspace.isLinkActive("fabric/profileView") 
                                       && !workspace.isLinkActive("fabric/containerView")
                                       && !workspace.isLinkActive("fabric/deploy")
    });

    workspace.topLevelTabs.push({
      id: "fabric.profiles",
      content: "Profiles",
      title: "Select and deploy profiles into this fabric",
      isValid: (workspace) => Fabric.isFMCContainer(workspace),
      href: () => "#/fabric/profileView",
      isActive: (workspace) => workspace.isLinkActive("fabric/profileView")
    });

    workspace.topLevelTabs.push({
      id: 'fabric.containers',
      content: 'Containers',
      title: 'View and manage containers in this fabric',
      isValid: (workspace) => Fabric.isFMCContainer(workspace),
      href: () => '#/fabric/containerView',
      isActive: (workspace) => workspace.isLinkActive('fabric/containerView')
    });

    workspace.topLevelTabs.push( {
      id: "fabric.configuration",
      content: "Wiki",
      title: "View the documentation and configuration of your profiles in Fabric",
      isValid: (workspace, perspectiveId) => {
        var answer = Fabric.isFMCContainer(workspace);
        if (answer) {
          // must be in fabric perspective as we have wiki in container perspective as well which is not this plugin
          // [ENTESB-1701] special case when checking what plugins to show in Preferences -> Plugins page
          var currentId = Perspective.currentPerspectiveId($location, workspace, jolokia, localStorage);
          answer = "fabric" === (perspectiveId === undefined ? currentId : perspectiveId);
        }
        return answer;
      },
      href: () => {
        return "#/wiki/branch/" + Fabric.getActiveVersion($location) + "/view/fabric/profiles";
      },
      isActive: (workspace: Workspace) => workspace.isLinkActive("/wiki") && (workspace.linkContains("fabric", "profiles") || workspace.linkContains("editFeatures"))
    });
    workspace.topLevelTabs.push( {
      id: "fabric.insight",
      content: "Insight",
      title: "View insight into your fabric looking at logs, metrics and messages across the fabric",
      isValid: (workspace) => {
        return Fabric.isFMCContainer(workspace) && Insight.hasInsight(workspace)
      },
      href: () => {
        return "#/insight/all?p=insight";
      },
      isActive: (workspace:Workspace) => workspace.isLinkActive("/insight")
    });

    helpRegistry.addUserDoc('fabric', 'app/fabric/doc/help.md', () => {
      return Fabric.isFMCContainer(workspace);
    });
    // don't need to pass the isValid parameter in subsequent calls...
    helpRegistry.addDevDoc("fabric", 'app/fabric/doc/developer.md');

  }]);

  hawtioPluginLoader.addModule('fabric');
}
