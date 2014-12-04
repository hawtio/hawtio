/**
 * @module Site
 * @main Site
 */
/// <reference path="./siteHelpers.ts"/>
module Site {
  var pluginName = 'site';

  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'datatable', 'hawtioCore', 'hawtio-ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
      when('/site', {templateUrl: 'app/site/html/index.html'}).
      when('/site/', {templateUrl: 'app/site/html/index.html'}).
      when('/site/book/*page', {templateUrl: 'app/site/html/book.html', reloadOnSearch: false}).
      when('/site/*page', {templateUrl: 'app/site/html/page.html'});
  }]);

  _module.run(["$location", "workspace", "viewRegistry", "layoutFull", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

    viewRegistry[pluginName] = layoutFull;

    workspace.topLevelTabs.push({
      id: "site",
      content: "Site",
      title: "View the documentation for Hawtio",
      isValid: (workspace:Workspace) => false,
      href: () => "#/site"
    });

    /*
      helpRegistry.addUserDoc('log', 'app/log/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties('io.fabric8.insight', {type: 'LogQuery'});
      });

      */
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
