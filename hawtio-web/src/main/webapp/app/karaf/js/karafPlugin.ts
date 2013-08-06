module Karaf {
  var pluginName = 'karaf';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/osgi/server', {templateUrl: 'app/karaf/html/server.html'}).
            when('/osgi/features', {templateUrl: 'app/karaf/html/features.html'}).
            when('/osgi/scr', {templateUrl: 'app/karaf/html/scr.html'}).
            when('/osgi/feature/:name/:version', {templateUrl: 'app/karaf/html/feature.html'})
  }).
      run((workspace:Workspace, viewRegistry) => {

      });

  hawtioPluginLoader.addModule(pluginName);
}
