
// create our angular module and tell angular what route(s) it will handle
var pluginName = "gogo";

var simplePlugin = angular.module(pluginName, ['hawtioCore'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/gogo', {
          templateUrl: 'hawtio-karaf-terminal/app/html/gogo.html'
        });
  }).directive('gogoTerminal', function($document) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        var width = 120;
        var height = 39;

        var div = $('<div class="terminal">_</div>').css({
          position: 'absolute',
          left: -1000,
          top: -1000,
          display: 'none',
          padding: 0,
          margin: 0
        }).appendTo($('body'));

        var charWidth = div.width();
        var charHeight = div.height();

        div.remove();

        // compensate for internal horizontal padding
        var cssWidth = width * charWidth + 20;
        // Add an extra line for the status bar and divider
        var cssHeight = (height * charHeight) + charHeight + 2;

        /*
        console.log("width: ", width, " height: ", height);
        console.log("charWidth: ", charWidth, " charHeight: ", charHeight);
        console.log("cssWidth: ", cssWidth, " cssHeight: ", cssHeight);
        */

        element.css({
          width: cssWidth,
          height: cssHeight,
          'min-width': cssWidth,
          'min-height': cssHeight
        });

        gogo.Terminal(element.get(0), width, height);

        scope.$on("$destroy", function(e) {
          document.onkeypress = null;
          document.onkeydown = null;
        });

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
      isValid: function () { return workspace.treeContainsDomainAndProperties("hawtio", {type: "plugin", name: "hawtio-karaf-terminal"}) },
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

var GogoController = function($scope) {

  $scope.addToDashboardLink = function() {
    var href = "#/gogo";
    var size = angular.toJson({size_y: 4, size_x: 4});
    return "#/dashboard/add?tab=dashboard&href=" + encodeURIComponent(href) + "&size=" + encodeURIComponent(size);
  };

};
// tell the hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of angular
hawtioPluginLoader.addModule(pluginName);


