module Perspective {
  var pluginName = 'perspective';
  angular.module(pluginName, ['hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/perspective/defaultPage', {templateUrl: 'app/perspective/html/defaultPage.html',
                      controller: Perspective.DefaultPageController});
          });

  hawtioPluginLoader.addModule(pluginName);
}
