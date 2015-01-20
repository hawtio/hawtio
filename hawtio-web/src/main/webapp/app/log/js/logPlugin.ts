/**
 * @module Log
 * @main Log
 */
/// <reference path="./logHelpers.ts"/>
module Log {
  var pluginName = 'log';

  var hasMBean = false;

  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'datatable', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
      when('/logs', {templateUrl: 'app/log/html/logs.html', reloadOnSearch: false}).
      when('/openlogs', {redirectTo: () => {
        // use a redirect, as the log plugin may not be valid, if we connect to a JVM which does not have the log mbean
        // in the JMX tree, and if that happens, we need to redirect to home, so another tab is selected
        if (hasMBean) {
          return '/logs'
        } else {
          return '/home'
        }
      }, reloadOnSearch: false})
  }]);

  _module.run(["$location", "workspace", "viewRegistry", "layoutFull", "helpRegistry", "preferencesRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry, preferencesRegistry) => {

    hasMBean = treeContainsLogQueryMBean(workspace);

    viewRegistry['log'] = layoutFull;
    helpRegistry.addUserDoc('log', 'app/log/doc/help.md', () => {
      return treeContainsLogQueryMBean(workspace);
    });

    preferencesRegistry.addTab("Server Logs", "app/log/html/preferences.html", () => {
        return treeContainsLogQueryMBean(workspace);
      });

    workspace.topLevelTabs.push({
      id: "logs",
      content: "Logs",
      title: "View and search the logs of this container",
      isValid: (workspace:Workspace) => treeContainsLogQueryMBean(workspace),
      href: () => "#/logs"
    });

    workspace.subLevelTabs.push({
      content: '<i class="icon-list-alt"></i> Log',
      title: "View the logs in this process",
      isValid: (workspace:Workspace) => isSelectionLogQueryMBean(workspace),
      href: () => "#/logs"
    });
  }]);

  _module.filter('logDateFilter', ["$filter", ($filter) => {
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
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
