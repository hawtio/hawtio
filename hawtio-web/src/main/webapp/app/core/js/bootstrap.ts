/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../baseHelpers.ts"/>
// bootstrap the whole app here
$(() => {
  hawtioPluginLoader.loadPlugins(() => {
    var doc = angular.element(document);
    var docEl = angular.element(document.documentElement);
    Core.injector = angular.bootstrap(doc, hawtioPluginLoader.getModules());
    Logger.get("Core").debug("Bootstrapped application, injector: ", Core.injector);
    docEl.attr('xmlns:ng', "http://angularjs.org");
    docEl.attr('ng-app', 'hawtioCore');
  });
});

