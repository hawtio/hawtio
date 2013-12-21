/**
 * @module Quartz
 * @main Quartz
 */
module Quartz {
  var pluginName = 'quartz';
  export var jmxDomain = 'quartz';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/quartz/schedulers', {templateUrl: 'app/quartz/html/schedulers.html'})
          }).
          filter('quartzIconClass',() => iconClass).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

            viewRegistry['quartz'] = 'app/quartz/html/layoutQuartzTree.html';
            helpRegistry.addUserDoc('quartz', 'app/quartz/doc/help.md', () => {
              return workspace.treeContainsDomainAndProperties(jmxDomain);
            });

            workspace.topLevelTabs.push({
              id: "quartz",
              content: "Quartz",
              title: "Quartz Scheduler",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties(jmxDomain),
              href: () => "#/quartz/schedulers",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("quartz")
            });

          });

  hawtioPluginLoader.addModule(pluginName);
}
