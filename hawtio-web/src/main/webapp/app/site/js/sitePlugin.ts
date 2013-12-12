/**
 * @module Site
 * @main Site
 */
module Site {
  var pluginName = 'site';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'datatable', 'hawtioCore']).
    config(($routeProvider) => {
      $routeProvider.
        when('/site', {templateUrl: 'app/site/html/index.html'}).
        when('/site/', {templateUrl: 'app/site/html/index.html'}).
        when('/site/book/*page', {templateUrl: 'app/site/html/book.html', reloadOnSearch: false}).
        when('/site/*page', {templateUrl: 'app/site/html/page.html'});
    }).
    run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

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
       return workspace.treeContainsDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'});
       });

       */
    });

  hawtioPluginLoader.addModule(pluginName);
}
