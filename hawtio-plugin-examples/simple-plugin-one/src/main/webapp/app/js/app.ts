
angular.module('simple_plugin', ['main'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/simple_plugin', {
          templateUrl: '../hawtio/simple-plugin/app/html/simple.html',
          controller: SimpleController
        });
  })
  .run(function(links) {
    links.push("/simple_plugin");
  });

$.plugin_loader.addModule('simple_plugin');

var SimpleController = function($scope, home) {
  $scope.hello = "Hello world!";
  $scope.home = home;
}


