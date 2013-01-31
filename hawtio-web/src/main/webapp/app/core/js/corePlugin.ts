// bootstrap plugin loader
var jolokiaUrl = hawtioPluginLoader.parseQueryString()['url'] || "/hawtio/jolokia";

hawtioPluginLoader.addUrl("jolokia:" + jolokiaUrl + ":hawtio:type=plugin,name=*");
hawtioPluginLoader.addUrl('/hawtio/test.json');

interface IMyAppScope extends ng.IRootScopeService, ng.IScope {
  lineCount: (value:any) => number;
  params: ng.IRouteParamsService;
  is: (type:any, value:any) => bool;
  empty: (value:any) => bool;
  log: (variable:string) => void;
  alert: (text:string) => void;
}

var myApp = angular.module('hawtioCore', ['bootstrap', 'ngResource', 'ui']);

hawtioPluginLoader.addModule('hawtioCore');

myApp.config(($routeProvider) => {
  $routeProvider.
          when('/preferences', {templateUrl: 'app/core/html/preferences.html'}).
          when('/help', {
            redirectTo: '/help/overview'
          }).
          when('/help/:tabName', {templateUrl: 'app/core/html/help.html', controller: Core.NavBarController}).

          otherwise({redirectTo: '/help/overview'});
});

myApp.service('localStorage', function () {
  // TODO Create correct implementation of windowLocalStorage
  var storage:WindowLocalStorage = window.localStorage || <any> (function () {
    return {};
  })();
  return storage;
});

myApp.factory('jolokia', ($location:ng.ILocationService, localStorage) => {
  var jolokiaUrl = $location.search()['url'] || url("/jolokia");
  // console.log("Jolokia URL is " + jolokiaUrl);
  var jolokia = new Jolokia(jolokiaUrl);
  localStorage['url'] = jolokiaUrl;
  return jolokia;
});

myApp.factory('workspace', ($location:ng.ILocationService, $compile:ng.ICompileService, $templateCache:ng.ITemplateCacheService, localStorage:WindowLocalStorage, jolokia, $rootScope) => {
  var answer = new Workspace(jolokia, $location, $compile, $templateCache, localStorage, $rootScope);
  answer.loadTree();
  return answer;
});


myApp.filter('humanize', () => humanizeValue)


myApp.run(($rootScope, $routeParams, jolokia, workspace, localStorage, viewRegistry, layoutFull) => {

  $.support.cors = true;

  /**
   * Count the number of lines in the given text
   */
  $rootScope.lineCount = lineCount;

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
   * Initialize jolokia polling and add handler to change poll
   * frequency
   */
  // only reset the update rate if its not defined
  var updateRate = localStorage['updateRate'];
  if (angular.isUndefined(updateRate)) {
    localStorage['updateRate'] = 5000;
  }

  $rootScope.$on('UpdateRate', (event, rate) => {
    jolokia.stop();
    if (rate > 0) {
      jolokia.start(rate);
    }
    console.log("Set update rate to: " + rate);
  });

  $rootScope.$emit('UpdateRate', localStorage['updateRate']);

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

  viewRegistry['fullscreen'] = layoutFull;
  viewRegistry['notree'] = layoutFull;
  viewRegistry['help'] = layoutFull;
  viewRegistry['preferences'] = layoutFull;

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

myApp.constant('editablePropertyTemplate',
    '<div ng-hide="editing">' +
      '{{text}}&nbsp;<i class="ep-edit icon-pencil" title="Edit this item" ng-click="doEdit()"></i>' +
    '</div>' +
    '<div ng-show="editing">' +
      '<form class="form-inline">' +
        '<fieldset>' +
          '<input type="text" value="{{text}}">' +
          '<i class="red icon-remove" title="Discard changes" ng-click="stopEdit()"></i>' +
          '<i class="green icon-ok" title="Save changes" ng-click="saveEdit()"></i>' +
        '</fieldset>' +
       '</form>' +
    '</div>');

myApp.directive('editableProperty', ['$compile', 'editablePropertyTemplate', function($compile, editablePropertyTemplate) {
  var editableProperty = {
    restrict: 'E',
    scope: true,
    template: editablePropertyTemplate,
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {

      scope.editing = false;

      ngModel.$render = function() {
        scope.text = ngModel.$viewValue;
      }

      scope.doEdit = function() {
        scope.editing = true;
      }

      scope.stopEdit = function() {
        scope.editing = false;
      }

      scope.saveEdit = function() {
        var value = $(element.find(":input[type=text]")[0]).val();
        ngModel.$setViewValue(value);
        ngModel.$render();
        scope.editing = false;
      }

    }
  }
  return editableProperty;
}]);

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

main.config(function ($routeProvider) {
  $routeProvider.when('/plugins', {
    templateUrl: 'html/plugins.html',
    controller: PluginController
  });

  //$locationProvider.html5Mode(true);
});

// service for plugins to register links
main.factory('links', function () {
  var answer = [];
  return answer;
});

// constant for plugin to link back to main page
main.constant('home', '#/hawtio');

main.run(function () {
  // console.log("main app running");
});

var PluginController = function ($scope, $route, links) {
  $scope.routes = JSON.stringify($route.routes, null, 4);
  $scope.links = links;
}

hawtioPluginLoader.addModule('main');
// ---------------------------------------------------------

$(function () {
  hawtioPluginLoader.loadPlugins(function () {
    angular.bootstrap($(document), hawtioPluginLoader.getModules());
  });
});


