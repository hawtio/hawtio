module Tomcat {
  var pluginName = 'tomcat';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
      $routeProvider.
          when('/tomcat', {templateUrl: 'app/tomcat/html/tomcat.html'}).
          when('/tomcat/connectors', {templateUrl: 'app/tomcat/html/connectors.html'})
  }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {

             viewRegistry['tomcat'] = layoutFull;

          workspace.topLevelTabs.push( {
              content: "Tomcat",
              title: "Manage your Tomcat container",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("Tomcat") || workspace.treeContainsDomainAndProperties("Catalina"),
              href: () => "#/tomcat",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("tomcat")
          });

          workspace.subLevelTabs.push( {
              content: "Tomcat Connectors",
              title: "Manage your Tomcat connectors",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("Tomcat") || workspace.treeContainsDomainAndProperties("Catalina"),
              href: () => "#/tomcat/connectors",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("tomcat")
          });

      });

  hawtioPluginLoader.addModule(pluginName);
}
