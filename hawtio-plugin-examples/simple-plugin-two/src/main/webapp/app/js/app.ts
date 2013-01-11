
angular.module('simple_plugin_two', ['main'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/simple_plugin_two', {
          templateUrl: '../hawtio/simple-plugin-two/app/html/simple.html',
          controller: OtherSimpleController
        });
  })
  .run(function(links) {
    links.push("/simple_plugin_two");
  });

hawtioPluginLoader.addModule('simple_plugin_two');

var OtherSimpleController = function($scope, home) {
  $scope.hello = "Hello world from #2!";
  $scope.home = home;
}



