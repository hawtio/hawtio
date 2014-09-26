/**
 * @module Source
 * @main Source
 */
/// <reference path="./sourceHelpers.ts"/>
module Source {
  var pluginName = 'source';
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'wiki']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/source/index/:mavenCoords', {templateUrl: 'app/source/html/index.html'}).
            when('/source/index/:mavenCoords/*page', {templateUrl: 'app/source/html/index.html'}).
            when('/source/view/:mavenCoords/class/:className/*page', {templateUrl: 'app/source/html/source.html'}).
            when('/source/view/:mavenCoords/*page', {templateUrl: 'app/source/html/source.html'}).
            when('/source/javadoc/:mavenCoords/*page', {templateUrl: 'app/source/html/javadoc.html'});
  }]);

  _module.run(["$location", "workspace", "viewRegistry", "jolokia", "localStorage", "layoutFull", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, jolokia, localStorage, layoutFull, helpRegistry) => {

    viewRegistry['source'] = layoutFull;
    helpRegistry.addUserDoc('source', 'app/source/doc/help.md');

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
