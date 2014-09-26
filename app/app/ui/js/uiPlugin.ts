/**
 * Module that contains a bunch of re-usable directives to assemble into pages in hawtio
 *
 * @module UI
 * @main UI
 */
/// <reference path="../../core/js/corePlugin.ts"/>
/// <reference path="./CodeEditor.ts"/>
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

  UI._module.controller("CodeEditor.PreferencesController", ["$scope", "localStorage", "$templateCache", ($scope, localStorage, $templateCache) => {
    $scope.exampleText = $templateCache.get("exampleText");
    $scope.codeMirrorEx = $templateCache.get("codeMirrorExTemplate");
    $scope.javascript = "javascript";

    $scope.preferences = CodeEditor.GlobalCodeMirrorOptions;

    // If any of the preferences change, make sure to save them automatically
    $scope.$watch("preferences", function(newValue, oldValue) {
      if (newValue !== oldValue) {
        // such a cheap and easy way to update the example view :-)
        $scope.codeMirrorEx += " ";
        localStorage['CodeMirrorOptions'] = angular.toJson(angular.extend(CodeEditor.GlobalCodeMirrorOptions, $scope.preferences));
      }
    }, true);

  }]);

  _module.run(["localStorage", (localStorage) => {
    var opts = localStorage['CodeMirrorOptions'];
    if (opts) {
      opts = angular.fromJson(opts);
      CodeEditor.GlobalCodeMirrorOptions = angular.extend(CodeEditor.GlobalCodeMirrorOptions, opts);
    }
  }]);

  hawtioPluginLoader.addModule(pluginName);

}
