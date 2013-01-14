
// bootstrap plugin loader
var jolokiaUrl = hawtioPluginLoader.parseQueryString()['url'] || "/jolokia";

hawtioPluginLoader.addUrl("jolokia:" + jolokiaUrl + ":hawtio:type=plugin,name=*");
hawtioPluginLoader.addUrl('/hawtio/test.json');

interface IMyAppScope extends ng.IRootScopeService, ng.IScope {
  lineCount: (value:any) => number;
  detectTextFormat: (value:any) => string;
  params: ng.IRouteParamsService;
  is: (type:any, value:any) => bool;
  empty: (value:any) => bool;
  log: (variable:string) => void;
  alert: (text:string) => void;
}

var myApp = angular.module('hawtioCore', ['bootstrap', 'ngResource']);

hawtioPluginLoader.addModule('hawtioCore');

myApp.config(($routeProvider) => {
  $routeProvider.
          when('/attributes', {templateUrl: 'app/core/html/attributes.html', controller: Core.AttributesController}).
          when('/operations', {templateUrl: 'app/core/html/operations.html', controller: Core.OperationsController}).
          when('/charts', {templateUrl: 'app/core/html/charts.html', controller: Core.Charts.ChartController}).
          when('/chartEdit', {templateUrl: 'app/core/html/chartEdit.html', controller: Core.Charts.ChartEditController}).
          when('/preferences', {templateUrl: 'app/core/html/preferences.html'}).
          when('/help', {
            redirectTo: '/help/overview'
          }).
          when('/help/:tabName', {templateUrl: 'app/core/html/help.html', controller: Core.NavBarController}).

          otherwise({redirectTo: '/help/overview'});
}).
        factory('workspace',($rootScope:IMyAppScope, $routeParams:ng.IRouteParamsService, $location:ng.ILocationService, $compile:ng.ICompileService, $templateCache:ng.ITemplateCacheService, localStorage:WindowLocalStorage) => {
          var jolokiaUrl = $location.search()['url'] || url("/jolokia");
          $.support.cors = true;
          var workspace = new Workspace(jolokiaUrl, $location, $compile, $templateCache, localStorage);

          /**
           * Count the number of lines in the given text
           */
          $rootScope.lineCount = lineCount;

          /**
           * Detect the text format such as javascript or xml
           */
          $rootScope.detectTextFormat = detectTextFormat;

          /**
           * Easy access to route params
           */
          $rootScope.params = $routeParams;

          /**
           * Wrapper for angular.isArray, isObject, etc checks for use in the view
           *
           * @param type {string} the name of the check (casing sensitive)
           * @param value {string} value to check
           */
          $rootScope.is = function (type:any, value:any):bool {
            return angular['is' + type](value);
          };

          /**
           * Wrapper for $.isEmptyObject()
           *
           * @param value  {mixed} Value to be tested
           * @return boolean
           */
          $rootScope.empty = function (value:any):bool {
            return $.isEmptyObject(value);
          };

          /**
           * Debugging Tools
           *
           * Allows you to execute debug functions from the view
           */
            // TODO Doesn't support vargs like it should
          $rootScope.log = function (variable:any):void {
            console.log(variable);
          };
          $rootScope.alert = function (text:string) {
            alert(text);
          };
          return workspace;
        }).
        filter('humanize',() => humanizeValue).
        service("localStorage", function () {
          // TODO Create correct implementation of windowLocalStorage
          var storage:WindowLocalStorage = window.localStorage || <any> (function () {
            return {};
          })();
          return storage;
        });


myApp.directive('expandable', function () {
  return {
    restrict: 'C',
    replace: false,
    link: function (scope, element, attrs) {
      var expandable = $(element);

      var title = expandable.find('.title');
      var button = expandable.find('.cancel');

      button.bind('click', function () {
        expandable.addClass('closed');
        expandable.removeClass('opened');
        return false;
      });

      title.bind('click', function () {
        expandable.toggleClass('opened');
        expandable.toggleClass('closed');
        return false;
      });

    }
  }

});

// enable bootstrap tooltips
$(function () {
  $("a[title]").tooltip({
    selector: '',
    delay: { show: 1000, hide: 100 }
  });
});


// TODO -- this is just here so the simple plugin examples
// work and don't break the app :-/
// ---------------------------------------------------------
var main = angular.module('main', []);

main.config(function($routeProvider) {
  $routeProvider.when('/plugins', {
      templateUrl: 'html/plugins.html',
      controller: PluginController
    });

    //$locationProvider.html5Mode(true);
});

main.factory('jolokia', function($location:ng.ILocationService) {
  var url = $location.search()['url'] || "/jolokia";
  // console.log("Jolokia URL is " + url);
  return new Jolokia(url);
});

// service for plugins to register links
main.factory('links', function() {
  var answer = [];
  return answer;
});

// constant for plugin to link back to main page
main.constant('home', '#/hawtio');

main.run( function () {
    // console.log("main app running");
});

var PluginController = function($scope, $route, links) {
  $scope.routes = JSON.stringify($route.routes, null, 4);
  $scope.links = links;
}

hawtioPluginLoader.addModule('main');
// ---------------------------------------------------------

$(document).ready(function() {

      hawtioPluginLoader.loadPlugins(function() {
        angular.bootstrap($(document), hawtioPluginLoader.getModules());
      });
});


