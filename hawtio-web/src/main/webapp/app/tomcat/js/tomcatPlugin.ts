module Tomcat {
  var pluginName = 'tomcat';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
      // TODO custom tomcat views go here...
  }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry) => {

            viewRegistry['tomcat'] = "app/tomcat/html/layoutTomcatTree.html";

            workspace.topLevelTabs.push( {
              content: "Tomcat",
              title: "Manage your Tomcat container",
              isValid: () => workspace.treeContainsDomainAndProperties("Tomcat") || workspace.treeContainsDomainAndProperties("Catalina"),
              href: () => "#/jmx/attributes?tab=tomcat",
              isActive: () => workspace.isTopTabActive("tomcat")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
