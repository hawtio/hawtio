module Tomcat {
  var pluginName = 'tomcat';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
      $routeProvider.
          when('/tomcat', {templateUrl: 'app/tomcat/html/tomcat.html'})
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

      });

  hawtioPluginLoader.addModule(pluginName);
}
