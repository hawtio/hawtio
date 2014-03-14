

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
  log.debug("In view controller");

  $scope.links = {
    'test1.html': 'app/ui/html/test1.html',
    'test2.html': 'app/ui/html/test2.html'
  };

  $scope.getContents = function(filename, cb) {
    $http({method: 'GET', url: $scope.links[filename]})
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

