/**
 * @module Diagnostics
 * @main Diagnostics
 */
/// <reference path="diagnosticHelpers.ts"/>
module Diagnostics {

  export var rootPath = 'app/diagnostics';
  export var templatePath = rootPath + '/html/';
  export var pluginName = 'diagnostics';

  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'datatable', 'hawtioCore', 'hawtio-forms', 'ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/diagnostics/jfr', {templateUrl: templatePath + 'jfr.html'}).
            when('/diagnostics/heap', {templateUrl: templatePath + 'heap.html'}).
            when('/diagnostics/flags', {templateUrl: templatePath + 'flags.html'});
  }]);

  _module.constant('mbeanName', 'com.sun.management:type=DiagnosticCommand');

  _module.run(["$location", "workspace", "viewRegistry", "layoutFull", "helpRegistry", "preferencesRegistry",  ($location, workspace:Workspace, viewRegistry, layoutFull, helpRegistry, preferencesRegistry) => {

    viewRegistry[pluginName] = templatePath + 'layoutDiagnostics.html';
    helpRegistry.addUserDoc('diagnostics', 'app/diagnostics/doc/help.md');
    
    Core.addCSS(rootPath + "/css/diagnostics.css");

//    preferencesRegistry.addTab("Connect", 'app/jvm/html/reset.html');

    workspace.topLevelTabs.push({
      id: "diagnostics",
      content: "Diagnostics",
      title: "JVM Diagnostics",
      isValid: (workspace) => {
          return workspace.treeContainsDomainAndProperties("com.sun.management") && initialTab(workspace);
      },
      href: () => {
        return '#/diagnostics' + initialTab(workspace);
      },
      isActive: (workspace:Workspace) => workspace.isLinkActive("diagnostics")
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
