module Apollo {
  var pluginName = 'apollo';
  angular.
    module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
    config(($routeProvider) => {
      $routeProvider.
        when('/apollo/*part', {templateUrl: 'app/apollo/html/layout-apollo.html'})
    }).
    run(($location: ng.ILocationService, workspace:Workspace, viewRegistry) => {
      viewRegistry['apollo'] = "app/apollo/html/layout-apollo.html";
      workspace.topLevelTabs.push( {
        content: "Apollo",
        title: "Manage your Apollo Broker",
        isValid: (workspace) => workspace.treeContainsDomainAndProperties("org.apache.apollo"),
        href: () => '#/apollo',
        isActive: (workspace:Workspace) => workspace.isLinkActive("apollo")
      });
    });
  hawtioPluginLoader.addModule(pluginName);
}
