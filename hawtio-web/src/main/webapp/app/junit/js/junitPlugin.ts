/**
 * @module JUnit
 * @main JUnit
 */
/// <reference path="./junitHelpers.ts"/>
module JUnit {
  var pluginName = 'junit';

  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'datatable', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/junit/tests', {templateUrl: 'app/junit/html/tests.html', reloadOnSearch: false})
  }]);

  _module.factory('inProgressStatus', () => {
    return {
      jhandle: null,
      data: null,
      result: null,
      alertClass: "success"
    };
  });

  _module.run(["$location", "workspace", "jolokia", "viewRegistry", "layoutFull", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, jolokia, viewRegistry, layoutFull, helpRegistry) => {

    viewRegistry['junit'] = 'app/junit/html/layoutJUnitTree.html';

    helpRegistry.addUserDoc('junit', 'app/junit/doc/help.md', () => {
      return isJUnitPluginEnabled(workspace, jolokia);
    });

    workspace.topLevelTabs.push({
      id: "junit",
      content: "JUnit",
      title: "View and run test cases in this process",
      isValid: (workspace:Workspace) => isJUnitPluginEnabled(workspace, jolokia),
      href: () => "#/junit/tests"
    });

/*
    workspace.subLevelTabs.push({
      content: '<i class="icon-list-alt"></i> JUnit',
      title: "View the logs in this process",
      isValid: (workspace:Workspace) => workspace.hasDomainAndProperties('io.fabric8.insight', {type: 'JUnitQuery'}),
      href: () => "#/logs"
    });
*/
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
