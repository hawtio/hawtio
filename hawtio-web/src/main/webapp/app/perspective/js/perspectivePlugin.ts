/**
 * @module Perspective
 * @main Perspective
 */
module Perspective {
  var pluginName = 'perspective';
  angular.module(pluginName, ['hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/perspective/defaultPage', {templateUrl: 'app/perspective/html/defaultPage.html',
                      controller: Perspective.DefaultPageController});
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {

            viewRegistry['perspective'] = layoutFull;

          });

  hawtioPluginLoader.addModule(pluginName);
}
