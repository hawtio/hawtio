// create our angular module and tell angular what route(s) it will handle
var simplePlugin = angular.module('simple_plugin', ['hawtioCore'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/simple_plugin', {
          templateUrl: '../hawtio/simple-plugin/app/html/simple.html'
        });
  })


simplePlugin.run(function(workspace, viewRegistry, layoutFull) {

    // tell the app to use the full layout, also could use layoutTree
    // to get the JMX tree or provide a URL to a custom layout
    viewRegistry["simple_plugin"] = layoutFull;

    // Set up top-level link to our plugin
    workspace.topLevelTabs.push({
      id: "simple",
      content: "Simple",
      title: "Simple plugin loaded dynamically",
      isValid: function() { return true; },
      href: function() { return "#/simple_plugin"; },
      isActive: function() { return workspace.isLinkActive("simple_plugin"); }

    });

  });

// tell the hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of angular
hawtioPluginLoader.addModule('simple_plugin');

var SimpleController = function($scope, jolokia) {
  $scope.hello = "Hello world!";
  $scope.cpuLoad = "0"

  // register a watch with jolokia on this mbean to
  // get updated metrics
  Core.register(jolokia, $scope, {
    type: 'read', mbean: 'java.lang:type=OperatingSystem',
    arguments: []
  }, onSuccess(render));

  // update display of metric
  function render(response) {
    $scope.cpuLoad = response.value['ProcessCpuLoad'];
    $scope.$apply();
  }

}


