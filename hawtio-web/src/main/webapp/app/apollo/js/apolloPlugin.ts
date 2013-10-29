module Apollo {
  var pluginName = 'apollo';
  angular.
    module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
    config(($routeProvider) => {
      $routeProvider.
        when('/apollo', {templateUrl: 'app/apollo/html/layout-apollo.html'})
        //otherwise({templateUrl: 'app/apollo/html/layout-apollo.html'})
    }).
    run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

      viewRegistry['apollo'] = "app/apollo/html/layout-apollo.html";
      helpRegistry.addUserDoc('apollo', 'app/apollo/doc/help.md', () => {
        return workspace.treeContainsDomainAndProperties("org.apache.apollo");
      });


      workspace.topLevelTabs.push( {
        content: "Apollo",
        title: "Manage your Apollo Broker",
        isValid: (workspace) => workspace.treeContainsDomainAndProperties("org.apache.apollo"),
        href: () => '#/apollo/virtual-hosts',
        isActive: (workspace:Workspace) => workspace.isLinkActive("apollo")
      });
    });
  hawtioPluginLoader.addModule(pluginName);
}
