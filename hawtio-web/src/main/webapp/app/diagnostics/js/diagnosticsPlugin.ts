/**
 * @module Diagnostics
 * @main Diagnostics
 */
/// <reference path="diagnosticHelpers.ts"/>
namespace Diagnostics {

  const rootPath = 'app/diagnostics';
  const templatePath = rootPath + '/html/';
  const pluginName = 'diagnostics';

  export const _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'datatable', 'hawtioCore', 'hawtio-forms', 'ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/diagnostics/jfr', {templateUrl: templatePath + 'jfr.html'}).
            when('/diagnostics/heap', {templateUrl: templatePath + 'heap.html'}).
            when('/diagnostics/flags', {templateUrl: templatePath + 'flags.html'});
  }]);

  _module.constant('mbeanName', 'com.sun.management:type=DiagnosticCommand');

  _module.run(["workspace", "viewRegistry", "helpRegistry",  ( workspace:Workspace, viewRegistry, helpRegistry) => {

    viewRegistry[pluginName] = templatePath + 'layoutDiagnostics.html';
    helpRegistry.addUserDoc('diagnostics', 'app/diagnostics/doc/help.md');
    
    Core.addCSS(rootPath + "/css/diagnostics.css");


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
