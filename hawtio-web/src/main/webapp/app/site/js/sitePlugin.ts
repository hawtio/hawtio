module Site {
  var pluginName = 'site';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'datatable', 'hawtioCore']).
    config(($routeProvider) => {
      $routeProvider.
        when('/site', {templateUrl: 'app/site/html/book.html'}).
        when('/site/*page', {templateUrl: 'app/site/html/book.html'});
    }).
    run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

      viewRegistry[pluginName] = layoutFull;

      workspace.topLevelTabs.push({
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
