/**
 * @module Tomcat
 * @main Tomcat
 */
/// <reference path="./tomcatHelpers.ts"/>
module Tomcat {
  var pluginName = 'tomcat';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ui.bootstrap.dialog', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/tomcat/server', {templateUrl: 'app/tomcat/html/server.html'}).
            when('/tomcat/applications', {templateUrl: 'app/tomcat/html/applications.html'}).
            when('/tomcat/connectors', {templateUrl: 'app/tomcat/html/connectors.html'}).
            when('/tomcat/sessions', {templateUrl: 'app/tomcat/html/sessions.html'});
  }]);

  _module.filter('tomcatIconClass', () => iconClass);

  _module.run(["$location", "workspace", "viewRegistry", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

    viewRegistry['tomcat'] = "app/tomcat/html/layoutTomcatTabs.html";
    helpRegistry.addUserDoc('tomcat', 'app/tomcat/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties("Tomcat") ||
              workspace.treeContainsDomainAndProperties("Catalina")
    });

    workspace.topLevelTabs.push({
      id: "tomcat",
      content: "Tomcat",
      title: "Manage your Tomcat container",
      isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties("Tomcat") || workspace.treeContainsDomainAndProperties("Catalina"),
      href: () => "#/tomcat/applications",
      isActive: (workspace:Workspace) => workspace.isTopTabActive("tomcat")
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
