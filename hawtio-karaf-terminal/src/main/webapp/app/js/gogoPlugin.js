
// create our angular module and tell angular what route(s) it will handle
var pluginName = "gogo";

var simplePlugin = angular.module(pluginName, ['hawtioCore'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/gogo', {
          templateUrl: 'hawtio-karaf-terminal/app/html/gogo.html'
        });
  }).directive('gogoTerminal', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        console.log("element: ", element);
        console.log("here, gogo: ", gogo);
        gogo.Terminal(element.get(0), 120, 39);
        }
    };
  }).run(function(workspace, viewRegistry, layoutFull) {

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

    var link = $("<link>");
    $("head").append(link);

    link.attr({
      rel: 'stylesheet',
      type: 'text/css',
      href: 'hawtio-karaf-terminal/css/gogo.css'
    });

  });


// tell the hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of angular
hawtioPluginLoader.addModule(pluginName);


