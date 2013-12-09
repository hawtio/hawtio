/**
 * @module JUnit
 * @main JUnit
 */
module JUnit {
  var pluginName = 'junit';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'datatable', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/junit/tests', {templateUrl: 'app/junit/html/tests.html', reloadOnSearch: false})
          }).
          factory('inProgressStatus',function () {
            return {
              jhandle: null,
              data: null,
              alertClass: "success"
            };
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

            viewRegistry['junit'] = 'app/junit/html/layoutJUnitTree.html';
/*
            helpRegistry.addUserDoc('junit', 'app/junit/doc/help.md', () => {
              return isJUnitPluginEnabled(workspace);
            });
*/

            workspace.topLevelTabs.push({
              content: "JUnit",
              title: "View and run test cases in this process",
              isValid: (workspace:Workspace) => isJUnitPluginEnabled(workspace),
              href: () => "#/junit/tests"
            });

/*
            workspace.subLevelTabs.push({
              content: '<i class="icon-list-alt"></i> JUnit',
              title: "View the logs in this process",
              isValid: (workspace:Workspace) => workspace.hasDomainAndProperties('org.fusesource.insight', {type: 'JUnitQuery'}),
              href: () => "#/logs"
            });
*/
          });

  hawtioPluginLoader.addModule(pluginName);
}
