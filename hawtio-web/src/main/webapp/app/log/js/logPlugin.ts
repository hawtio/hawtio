module Log {
  var pluginName = 'log';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'hawtioCore']).
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
          filter('logDateFilter', function ($filter) {
            var standardDateFilter = $filter('date');
            return function (dateToFormat) {
              return standardDateFilter(dateToFormat, 'yyyy-MM-dd HH:mm:ss');
            }
          });

  hawtioPluginLoader.addModule(pluginName);
}
