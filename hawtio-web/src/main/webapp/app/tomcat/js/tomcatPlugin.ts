module Tomcat {
  var pluginName = 'tomcat';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/tomcat/server', {templateUrl: 'app/tomcat/html/server.html'}).
                    when('/tomcat/applications', {templateUrl: 'app/tomcat/html/applications.html'}).
                    when('/tomcat/connectors', {templateUrl: 'app/tomcat/html/connectors.html'}).
                    when('/tomcat/mbeans', {templateUrl: 'app/tomcat/html/mbeans.html'});
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {

            viewRegistry['tomcat'] = "app/tomcat/html/layoutTomcatTabs.html";
            viewRegistry['tomcatTree'] = "app/tomcat/html/layoutTomcatTree.html";

            workspace.topLevelTabs.push({
              content: "Tomcat",
              title: "Manage your Tomcat container",
              isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties("Tomcat") || workspace.treeContainsDomainAndProperties("Catalina"),
              href: () => "#/tomcat/applications",
              isActive: (workspace:Workspace) => workspace.isTopTabActive("tomcat")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
