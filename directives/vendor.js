

Logger.setLevel({"value": 1, "name": "DEBUG"});

// initialize our module
var App;
(function(App) {
  var pluginName = "App";
  App.pluginName = pluginName;

  var log = Logger.get(pluginName);

  var module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ui', 'ui.bootstrap.dialog', 'hawtio-ui']);
  App.module = module;

  module.factory('log', function() {
    return log;
  });

  module.run(function() {
    log.info("App started...");
  });

  hawtioPluginLoader.addModule(pluginName);

})(App || (App = {}));


// now we can just add controllers
App.ViewController = function($scope, log, $http) {
    $scope.getContents = function(filename, cb) {
      var fullUrl = "app/ui/html/test/" + filename;
      log.info("Finding file: " + fullUrl);
      $http({method: 'GET', url: fullUrl})
          .success(function(data, status, headers, config) {
            cb(data);
          })
          .error(function(data, status, headers, config) {
            cb("Failed to fetch " + filename + ": " + data);
          });
    };
  };

// bootstrap app via plugin loader
$(function () {
  hawtioPluginLoader.loadPlugins(function () {
    var doc = $(document);
    angular.bootstrap(doc, hawtioPluginLoader.getModules());
    $(document.documentElement).attr('xmlns:ng', "http://angularjs.org");
    $(document.documentElement).attr('ng-app', 'App');
  });
});

