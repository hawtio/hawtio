/**
 * @module Apollo
 * @main Apollo
 */
module Apollo {
  export var pluginName = 'apollo';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
      when('/apollo', {templateUrl: 'app/apollo/html/layout-apollo.html'})
      //otherwise({templateUrl: 'app/apollo/html/layout-apollo.html'})
  }]);

  _module.run(["$location", "workspace", "viewRegistry", "helpRegistry", ($location: ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

    viewRegistry['apollo'] = "app/apollo/html/layout-apollo.html";
    helpRegistry.addUserDoc('apollo', 'app/apollo/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties("org.apache.apollo");
    });

    workspace.topLevelTabs.push( {
      id: "apollo",
      content: "Apollo",
      title: "Manage your Apollo Broker",
      isValid: (workspace) => workspace.treeContainsDomainAndProperties("org.apache.apollo"),
      href: () => '#/apollo/virtual-hosts',
      isActive: (workspace:Workspace) => workspace.isLinkActive("apollo")
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
