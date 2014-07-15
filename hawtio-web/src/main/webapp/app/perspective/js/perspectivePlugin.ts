/**
 * @module Perspective
 * @main Perspective
 */
/// <reference path="./perspectiveHelpers.ts"/>
/// <reference path="../../core/js/corePlugin.ts"/>
module Perspective {
  var pluginName = 'perspective';

  export var _module = angular.module(pluginName, ['hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/perspective/defaultPage', {templateUrl: 'app/perspective/html/defaultPage.html',
              controller: Perspective.DefaultPageController});
  }]);

  _module.run(["$location", "workspace", "viewRegistry", "layoutFull", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {
    viewRegistry['perspective'] = layoutFull;
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
