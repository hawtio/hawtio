/**
 * @module JBoss
 * @main JBoss
 */
/// <reference path="jbossHelpers.ts"/>
module JBoss {
  var pluginName = 'jboss';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ui.bootstrap.dialog', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
          when('/jboss/server', {templateUrl: 'app/jboss/html/server.html'}).
          when('/jboss/applications', {templateUrl: 'app/jboss/html/applications.html'}).
          when('/jboss/dmr', {templateUrl: 'app/jboss/html/dmr.html'}).
          when('/jboss/connectors', {templateUrl: 'app/jboss/html/connectors.html'});
  }]);

  _module.filter('jbossIconClass', () => iconClass);

  _module.run(["$location", "workspace", "viewRegistry", "helpRegistry", ($location: ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

    viewRegistry['jboss'] = "app/jboss/html/layoutJBossTabs.html";
    helpRegistry.addUserDoc(pluginName, 'app/' + pluginName + '/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties("jboss.as") ||
            workspace.treeContainsDomainAndProperties("jboss.jta") ||
            workspace.treeContainsDomainAndProperties("jboss.modules");
    });

    workspace.topLevelTabs.push( {
      id: "jboss",
      content: "JBoss",
      title: "Manage your JBoss container",
      isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("jboss.as") ||
              workspace.treeContainsDomainAndProperties("jboss.jta") ||
              workspace.treeContainsDomainAndProperties("jboss.modules"),
      href: () => "#/jboss/applications",
      isActive: (workspace: Workspace) => workspace.isTopTabActive("jboss")
    });

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
