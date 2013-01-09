interface IMyAppScope extends ng.IRootScopeService, ng.IScope {
    lineCount: (value: any) => number;
    detectTextFormat: (value: any) => string;
    params: ng.IRouteParamsService;
    is: (type:any, value:any) => bool;
    empty: (value:any) => bool;
    log: (variable:string) => void;
    alert: (text:string) => void;
}

var myApp = angular.module('hawt.io', ['bootstrap', 'ngResource']);
myApp.config(($routeProvider) => {
          $routeProvider.
                  when('/attributes', {templateUrl: 'app/core/html/attributes.html', controller: Core.AttributesController}).
                  when('/operations', {templateUrl: 'app/core/html/operations.html', controller: Core.OperationsController}).
                  when('/charts', {templateUrl: 'app/core/html/charts.html', controller: Core.Charts.ChartController}).
                  when('/chartEdit', {templateUrl: 'app/core/html/chartEdit.html', controller: Core.Charts.ChartEditController}).
                  when('/preferences', {templateUrl: 'app/core/html/preferences.html'}).
                  when('/logs', {templateUrl: 'app/core/html/logs.html', controller: Core.LogController}).
                  when('/help', {
                    redirectTo: '/help/overview'
                  }).
                  when('/help/:tabName', {templateUrl: 'app/core/html/help.html', controller: Core.NavBarController}).
                  when('/debug', {templateUrl: 'app/core/html/debug.html', controller: Core.AttributesController}).

                  // health
                  when('/health', {templateUrl: 'app/core/html/health.html', controller: Core.HealthController}).

                  // activemq
                  when('/browseQueue', {templateUrl: 'app/activemq/html/browseQueue.html', controller: ActiveMQ.BrowseQueueController}).
                  when('/subscribers', {templateUrl: 'app/activemq/html/subscribers.html', controller: ActiveMQ.SubscriberGraphController}).
                  when('/createQueue', {templateUrl: 'app/activemq/html/createQueue.html', controller: ActiveMQ.DestinationController}).
                  when('/createTopic', {templateUrl: 'app/activemq/html/createTopic.html', controller: ActiveMQ.DestinationController}).
                  when('/deleteQueue', {templateUrl: 'app/activemq/html/deleteQueue.html', controller: ActiveMQ.DestinationController}).
                  when('/deleteTopic', {templateUrl: 'app/activemq/html/deleteTopic.html', controller: ActiveMQ.DestinationController}).

                  // camel
                  when('/browseEndpoint', {templateUrl: 'app/camel/html/browseEndpoint.html', controller: Camel.BrowseEndpointController}).
                  when('/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html', controller: Camel.SendMessageController}).
                  when('/routes', {templateUrl: 'app/camel/html/routes.html'}).
                  when('/createEndpoint', {templateUrl: 'app/camel/html/createEndpoint.html', controller: Camel.EndpointController}).
                  when('/traceRoute', {templateUrl: 'app/camel/html/traceRoute.html', controller: Camel.TraceRouteController}).

                  // fabric
                  when('/fabric/containers', {templateUrl: 'app/fabric/html/containers.html', controller: Fabric.ContainersController}).

                  // osgi
                  when('/bundles', {templateUrl: 'app/osgi/html/bundles.html', controller: Osgi.BundleController}).

                  otherwise({redirectTo: '/help/overview'});
        }).
        factory('workspace',($rootScope : IMyAppScope, $routeParams:ng.IRouteParamsService, $location:ng.ILocationService, $compile:ng.ICompileService, $templateCache:ng.ITemplateCacheService, localStorage : WindowLocalStorage) => {
          var jolokiaUrl = $location.search()['url'] || url("/jolokia");
          $.support.cors = true;
          var workspace =  new Workspace(jolokiaUrl, $location, $compile, $templateCache, localStorage);

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
          $rootScope.is = function(type: any, value: any): bool {
          	return angular['is'+type](value);
          };

          /**
           * Wrapper for $.isEmptyObject()
           *
           * @param value	{mixed} Value to be tested
           * @return boolean
           */
          $rootScope.empty = function(value:any): bool {
          	return $.isEmptyObject(value);
          };

          /**
           * Debugging Tools
           *
           * Allows you to execute debug functions from the view
           */
          // TODO Doesn't support vargs like it should
          $rootScope.log = function(variable:any): void{
          	console.log(variable);
          };
          $rootScope.alert = function(text:string) {
          	alert(text);
          };
          return workspace;
        }).
        filter('humanize', () => humanizeValue).
        service("localStorage", function() {
            // TODO Create correct implementation of windowLocalStorage
            var storage : WindowLocalStorage = window.localStorage || <any> (function() {
                return {};
            })();
            return storage;
        });

module Core {
    export interface INavBarController extends ng.IScope{
        workspace : Workspace;
        hash : string;
        validSelection : (uri : string) => bool;
        isCurrentRoute : (string) => bool;
    }

    export function NavBarController($scope: INavBarController, $location: ng.ILocationService, workspace:Workspace) {
      // TODO why do we keep binding the workspace to the scope?
      $scope.workspace = workspace;

      $scope.validSelection = (uri) => workspace.validSelection(uri);

      // when we change the view/selection lets update the hash so links have the latest stuff
      $scope.$on('$routeChangeSuccess', function () {
        var hash = $location.search();

        // TODO there must be a nice function somewhere to do this in a nicer way!
        // NOTE we are not encoding anything
        var keyValuePairs : string[] = [];
        angular.forEach(hash, function(value, key) {
            keyValuePairs.push(key + "=" + value);
        });
        var text = "?" + keyValuePairs.join("&");

        $scope.hash = encodeURI(text);
      });

      $scope.isCurrentRoute = (page) => {
        // TODO Why is 'home' used? It doesn't appear anywhere
        var currentRoute = $location.path().substring(1) || 'home';
        var isCurrentRoute =  currentRoute.startsWith(page);
        return isCurrentRoute;
      };
    }

    export function HelpController($scope, $routeParams, $location) {
      // Each time controller is recreated, check tab in url
      $scope.currentTab = $routeParams.tabName;

      // When we click on a tab, the directive changes currentTab
      $scope.$watch('currentTab', function (name, oldName) {
        if (name !== oldName) {
          $location.path('help/' + name);
        }
      });
    }

    export function PreferencesController($scope, workspace:Workspace) {
      $scope.workspace = workspace;
      $scope.updateRate = workspace.getUpdateRate();

      $scope.$watch('updateRate', () => {
        $scope.workspace.setUpdateRate($scope.updateRate);
      });

      $scope.gotoServer = (url) => {
        console.log("going to server: " + url);
        //window.location = "#/attributes?url=" + url;
        window.open("#/attributes?url=" + encodeURIComponent(url));
      }
    }
}

myApp.directive('expandable', function() {
  return {
    restrict: 'C',
    replace: false,
    link: function(scope, element, attrs) {
      var expandable = $(element);

      var title = expandable.find('.title');
      var button = expandable.find('.cancel');

      button.bind('click', function() {
        expandable.addClass('closed');
        expandable.removeClass('opened');
        return false;
      });

      title.bind('click', function() {
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
