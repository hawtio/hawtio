var App = (function() {
  var pluginName = "App";
  var log = Logger.get(pluginName);

  var module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ui', 'ui.bootstrap.dialog', 'hawtio-ui']);

  module.run(function() {
    log.info("App started...");
  });

  hawtioPluginLoader.addModule(pluginName);

})();


$(function () {
  hawtioPluginLoader.loadPlugins(function () {
    var doc = $(document);
    angular.bootstrap(doc, hawtioPluginLoader.getModules());
    $(document.documentElement).attr('xmlns:ng', "http://angularjs.org");
    $(document.documentElement).attr('ng-app', 'App');
  });
});

