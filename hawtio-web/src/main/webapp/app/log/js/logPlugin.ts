/**
 * @module Log
 * @main Log
 */
module Log {
  var pluginName = 'log';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'datatable', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/logs', {templateUrl: 'app/log/html/logs.html', reloadOnSearch: false})
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

            viewRegistry['log'] = layoutFull;
            helpRegistry.addUserDoc('log', 'app/log/doc/help.md', () => {
              return workspace.treeContainsDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'});
            });

            workspace.topLevelTabs.push({
              id: "logs",
              content: "Logs",
              title: "View and search the logs of this container",
              isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'}),
              href: () => "#/logs"
            });

            workspace.subLevelTabs.push({
              content: '<i class="icon-list-alt"></i> Log',
              title: "View the logs in this process",
              isValid: (workspace:Workspace) => workspace.hasDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'}),
              href: () => "#/logs"
            });
          }).
          filter('logDateFilter', function ($filter) {
            var standardDateFilter = $filter('date');
            return function (log) {
              if (!log) {
                return null;
              }
              if (log.timestampMs) {
                return standardDateFilter(log.timestampMs, 'yyyy-MM-dd HH:mm:ss.sss')
              } else {
                return standardDateFilter(log.timestamp, 'yyyy-MM-dd HH:mm:ss')
              }
            }
          });

  hawtioPluginLoader.addModule(pluginName);
}
