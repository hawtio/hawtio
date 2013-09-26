module Camin {
  var pluginName = 'camin';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'hawtioCore']).
      config(($routeProvider) => {
        $routeProvider.
          when('/camin', {templateUrl: 'app/camin/html/camin.html'}).
          when('/camin/:exchangeId', {templateUrl: 'app/camin/html/camin.html'})
      }).
      run((workspace:Workspace, viewRegistry) => {

        viewRegistry["camin"] = "app/camin/html/layoutCamin.html";

        workspace.topLevelTabs.push( {
          content: "Camel",
          title: "Insight into Camel",
          isValid: (workspace) => Fabric.hasFabric(workspace),
          href: () => "#/camin",
          isActive: (workspace: Workspace) => workspace.isLinkActive("camin")
        });

      });

  hawtioPluginLoader.addModule(pluginName);
}
