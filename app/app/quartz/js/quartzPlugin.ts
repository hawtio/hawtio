/**
 * @module Quartz
 * @main Quartz
 */
/// <reference path="./quartzHelpers.ts"/>
module Quartz {
  var pluginName = 'quartz';
  export var jmxDomain = 'quartz';

  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/quartz/scheduler', {templateUrl: 'app/quartz/html/scheduler.html'}).
            when('/quartz/triggers', {templateUrl: 'app/quartz/html/triggers.html'}).
            when('/quartz/jobs', {templateUrl: 'app/quartz/html/jobs.html'});
  }]);

  _module.filter('quartzIconClass',() => iconClass);
  _module.filter('quartzMisfire',() => misfireText);
  _module.filter('quartzJobDataClassText',() => jobDataClassText);

  _module.run(["$location", "workspace", "viewRegistry", "layoutFull", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

    viewRegistry['quartz'] = 'app/quartz/html/layoutQuartzTree.html';
    helpRegistry.addUserDoc('quartz', 'app/quartz/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties(jmxDomain);
    });

    workspace.topLevelTabs.push({
      id: "quartz",
      content: "Quartz",
      title: "Quartz Scheduler",
      isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties(jmxDomain),
      href: () => "#/quartz/scheduler",
      isActive: (workspace:Workspace) => workspace.isTopTabActive("quartz")
    });

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
