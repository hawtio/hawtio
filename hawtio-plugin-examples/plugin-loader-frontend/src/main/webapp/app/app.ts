

var main = angular.module('main', []);

main.config(function($routeProvider) {
  $routeProvider.when('/plugins', {
      templateUrl: 'html/plugins.html',
      controller: PluginController
    })
    .otherwise({ redirectTo: '/plugins' });

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
main.constant('home', '#/plugins');

main.run( function () {
    // console.log("main app running");
});

var PluginController = function($scope, $route, links) {
  $scope.routes = JSON.stringify($route.routes, null, 4);
  $scope.links = links;
}


$(document).ready(function() {
    // use callback to execute angular bootstrap after all of the plugin
    // scripts have been loaded and initialized
    $.plugin_loader.loadPlugins(function() {
      $.plugin_loader.addModule('main');
      angular.bootstrap($(document), $.plugin_loader.getModules());
    });
});


