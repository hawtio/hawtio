/**
 * @module Perspective
 * @main Perspective
 */
/// <reference path="perspectiveHelpers.ts"/>
/// <reference path="../../core/js/corePlugin.ts"/>
module Perspective {
  var pluginName = 'perspective';

  export var _module = angular.module(pluginName, ['hawtioCore']);
  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/perspective/defaultPage', {
              templateUrl: 'app/perspective/html/defaultPage.html'
            }).
            otherwise({
              redirectTo: (parameters, path, search) => {
                return '/perspective/defaultPage';
              }
            });
  }]);

  _module.run(["viewRegistry", "layoutFull", "locationChangeStartTasks", (viewRegistry, layoutFull, locationChangeStartTasks:Core.ParameterizedTasks) => {
    viewRegistry['perspective'] = layoutFull;

    /* TODO - we can use this as a hook to maintain the perspective query param
    locationChangeStartTasks.addTask('PerspectiveParam', ($event:ng.IAngularEvent, newUrl:string, oldUrl:string) => {
      if (!Core.injector) {
        return;
      }
      var $location:ng.ILocationService = Core.injector.get('$location');
      //log.debug("PerspectiveParam task firing, newUrl: ", newUrl, " oldUrl", oldUrl);
      var oldParams = UrlHelpers.parseQueryString(oldUrl);
      var newParams = UrlHelpers.parseQueryString(newUrl);
      //log.debug("PerspectiveParam, newParams: ", newParams, " oldParams: ", oldParams);
    });
    */
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
