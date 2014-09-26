/**
 * @module Karaf
 * @main Karaf
 */
/// <reference path="karafHelpers.ts"/>
module Karaf {
  var pluginName = 'karaf';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']);
  
  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/osgi/server', {templateUrl: 'app/karaf/html/server.html'}).
            when('/osgi/features', {templateUrl: 'app/karaf/html/features.html', reloadOnSearch: false}).
            when('/osgi/scr-components', {templateUrl: 'app/karaf/html/scr-components.html'}).
            when('/osgi/scr-component/:name', {templateUrl: 'app/karaf/html/scr-component.html'}).
            when('/osgi/feature/:name/:version', {templateUrl: 'app/karaf/html/feature.html'})
  }]);


  _module.run(["workspace", "viewRegistry", "helpRegistry", (workspace:Workspace, viewRegistry, helpRegistry) => {

    helpRegistry.addUserDoc('karaf', 'app/karaf/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties('org.apache.karaf');
    });

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
