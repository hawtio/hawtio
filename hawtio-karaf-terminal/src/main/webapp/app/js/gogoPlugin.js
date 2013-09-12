
// create our angular module and tell angular what route(s) it will handle
var pluginName = "gogo";

var simplePlugin = angular.module(pluginName, ['hawtioCore'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/gogo', {
          templateUrl: '../hawtio/hawtio-karaf-terminal/app/html/gogo.html'
        });
  })


simplePlugin.run(function(workspace, viewRegistry, layoutFull) {

    // tell the app to use the full layout, also could use layoutTree
    // to get the JMX tree or provide a URL to a custom layout
    viewRegistry[pluginName] = layoutFull;

    // Set up top-level link to our plugin
    workspace.topLevelTabs.push({
      content: "Terminal",
      title: "Open a terminal to the server",
      isValid: function() { return true; },
      href: function() { return "#/gogo"; },
      isActive: function() { return workspace.isLinkActive("gogo"); }

    });

  });

// tell the hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of angular
hawtioPluginLoader.addModule(pluginName);

var GogoController = function($scope) {

}


