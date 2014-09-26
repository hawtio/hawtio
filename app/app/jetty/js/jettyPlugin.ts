/**
 * @module Jetty
 * @main Jetty
 */
/// <reference path="./jettyHelpers.ts"/>
module Jetty {
  var pluginName = 'jetty';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ui.bootstrap.dialog', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/jetty/server', {templateUrl: 'app/jetty/html/server.html'}).
            when('/jetty/applications', {templateUrl: 'app/jetty/html/applications.html'}).
            when('/jetty/connectors', {templateUrl: 'app/jetty/html/connectors.html'}).
            when('/jetty/threadpools', {templateUrl: 'app/jetty/html/threadpools.html'});
  }]);

  _module.filter('jettyIconClass',() => iconClass);

  _module.run(["$location", "workspace", "viewRegistry", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

    viewRegistry['jetty'] = "app/jetty/html/layoutJettyTabs.html";
    helpRegistry.addUserDoc('jetty', 'app/jetty/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties("org.eclipse.jetty.server");
    });

    workspace.topLevelTabs.push({
      id: "jetty",
      content: "Jetty",
      title: "Manage your Jetty container",
      isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties("org.eclipse.jetty.server"),
      href: () => "#/jetty/applications",
      isActive: (workspace:Workspace) => workspace.isTopTabActive("jetty")
    });

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
