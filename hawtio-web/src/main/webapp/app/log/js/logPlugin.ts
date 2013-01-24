module Log {
  var pluginName = 'log';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/logs', {templateUrl: 'app/log/html/logs.html', controller: LogController})
  }).
          run(($location: ng.ILocationService, workspace:Workspace) => {

            workspace.topLevelTabs.push( {
              content: "Logs",
              title: "View and search the logs of this container",
              isValid: () => workspace.treeContainsDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'}),
              href: () => "#/logs"
            });

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list-alt"></i> Log',
              title: "View the logs in this process",
              isValid: () => workspace.hasDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'}),
              href: () => "#/logs"
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
