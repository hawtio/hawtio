/**
 * Module that contains a bunch of re-usable directives to assemble into pages in hawtio
 *
 * @module UI
 * @main UI
 */
/// <reference path="./uiHelpers.ts"/>
module UI {

  export var pluginName = 'hawtio-ui';

  export var templatePath = 'app/ui/html/';

  export var _module = angular.module(UI.pluginName, ['bootstrap', 'ngResource', 'ui', 'ui.bootstrap']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
      when('/ui/developerPage', {templateUrl: templatePath + 'developerPage.html', reloadOnSearch: false});
  }]);

  _module.factory('UI', () => {
    return UI;
  });

  _module.factory('marked', () => {
    marked.setOptions({
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: true,
      sanitize: false,
      smartLists: true,
      langPrefix: 'language-'
    });
    return marked;
  });

  _module.directive('compile', ['$compile', ($compile) => {
    return (scope, element, attrs) => {
      scope.$watch(
        (scope) => {
          // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        (value) => {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value);

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );
    };
  }]);

  hawtioPluginLoader.addModule(pluginName);

}
