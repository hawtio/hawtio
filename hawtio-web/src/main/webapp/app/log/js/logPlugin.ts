module Log {
  var pluginName = 'log';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/logs', {templateUrl: 'app/log/html/logs.html'})
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {

            viewRegistry['log'] = layoutFull;

            workspace.topLevelTabs.push({
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
          filter('filterLogLevel', () => {
            // Used to represent the ordinal value of a log level
            var logLevels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"];
            return (logs:Log.ILog[], logLevelQuery, logLevelExactMatch:bool) => {
              if (logLevelQuery === "") {
                return logs;
              }
              // Exact match filtering
              if (logLevelExactMatch) {
                var filteredLogs = logs.filter((log:Log.ILog) => log.level === logLevelQuery);
                return filteredLogs;
              } else {
                // Filtering based on ordinal value, e.g. >= INFO (e.g. INFO would include WARN and ERROR)
                var logLevelQueryOrdinal = logLevels.indexOf(logLevelQuery);
                var filteredLogs = logs.filter((log:Log.ILog) => {
                  var logLevelOrdinal = logLevels.indexOf(log.level);
                  return logLevelOrdinal >= logLevelQueryOrdinal;
                });
                return filteredLogs;
              }
            };
          });

  hawtioPluginLoader.addModule(pluginName);
}
