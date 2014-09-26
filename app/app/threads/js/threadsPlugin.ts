/**
  * @module Threads
  * @main Threads
  */
module Threads {

  export var pluginName = 'threads';
  export var templatePath = 'app/threads/html/';
  export var log:Logging.Logger = Logger.get("Threads");
  export var jmxDomain = 'java.lang';
  export var mbeanType = 'Threading';
  export var mbean = jmxDomain + ":type=" + mbeanType;

  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
        when('/threads', {templateUrl: templatePath + 'index.html'});
  }]);

  _module.run(["$location", "workspace", "viewRegistry", "layoutFull", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {
    viewRegistry['threads'] = layoutFull;
    helpRegistry.addUserDoc('threads', 'app/threads/doc/help.md');
    workspace.topLevelTabs.push({
      id: "threads",
      content: "Threads",
      title: "JVM Threads",
      isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties(jmxDomain, {type: mbeanType}),
      href: () => "#/threads",
      isActive: (workspace:Workspace) => workspace.isTopTabActive("threads")
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
