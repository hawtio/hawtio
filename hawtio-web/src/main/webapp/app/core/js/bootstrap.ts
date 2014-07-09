/// <reference path="./corePlugin.ts"/>
// bootstrap the whole app here
$(() => {
  hawtioPluginLoader.loadPlugins(() => {
    var doc = $(document);
    angular.bootstrap(doc, hawtioPluginLoader.getModules());
    $(document.documentElement).attr('xmlns:ng', "http://angularjs.org");
    $(document.documentElement).attr('ng-app', 'hawtioCore');
  });
});

