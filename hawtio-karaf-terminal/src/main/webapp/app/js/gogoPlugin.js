
var Gogo = (function(Gogo) {
  // create our angular module and tell angular what route(s) it will handle
  var pluginName = "gogo";

  Gogo.context = "/hawtio-karaf-terminal";
  Gogo.templateUrl = Gogo.context + "/app/html/";

  var simplePlugin = angular.module(pluginName, ['hawtioCore'])
    .factory('log', function() {
      return Logger.get("Gogo");
    }).config(function($routeProvider) {
      $routeProvider.
        when('/gogo', {
            templateUrl: Gogo.templateUrl + 'gogo.html'
          });
    }).directive('gogoTerminal', function(log, userDetails) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          scope.$on("$destroy", function(e) {
            document.onkeypress = null;
            document.onkeydown = null;
          });

          var width = 120;
          var height = 39;

          var div = $('<div class="terminal">A</div>').css({
            position: 'absolute',
            left: -1000,
            top: -1000,
            display: 'block',
            padding: 0,
            margin: 0,
            'font-family': 'monospace'
          }).appendTo($('body'));

          var charWidth = div.width();
          var charHeight = div.height();

          div.remove();

          div = $('<div><div style="height: 300px">AAA</div></div>').css({
            position: 'absolute',
            left: -1000,
            top: -1000,
            display: 'block',
            padding: 0,
            margin: 0,
            'font-family': 'monospace',
            'overflow-y': 'scroll',
            'max-height': '100px'
          }).appendTo($('body'));

          var scrollWidth = div.width() - $("div", div).width();

          div.remove();

          // compensate for internal horizontal padding (10px for Firefox...)
          var cssWidth = width * charWidth + 20 + scrollWidth + 10;
          // Add an extra line for the status bar and divider
          var cssHeight = (height * charHeight) + charHeight + 2;

          log.debug("desired console size in characters, width: ", width, " height: ", height);
          log.debug("console size in pixels, width: ", cssWidth, " height: ", cssHeight);
          log.debug("character size in pixels, width: ", charWidth, " height: ", charHeight);

          // make sure it has minimum width of 1024 + 26 (some slack is needed), otherwise the terminal has interlaced empty lines
          if (cssWidth < 1050) {
            log.debug("Minimum width changed from " + cssWidth + " to 1050");
            cssWidth = 1050;
          }

          element.css({
            width: cssWidth,
            height: cssHeight,
            'min-width': cssWidth,
            'min-height': cssHeight,
            'margin-bottom': '3em'
          });

          var authHeader = Core.getBasicAuthHeader(userDetails.username, userDetails.password);

          var url = Gogo.context + "/auth/login/";

          $.ajax(url, {
            type: "POST",
            success: function (response) {
              log.debug("got back response: ", response);
              if ('term' in scope) {
                log.debug("Previous terminal created, let's clean it up");
                document.onkeypress = null;
                document.onkeydown = null;
                delete scope.term;
              }
              scope.term = gogo.Terminal(element.get(0), width, height, cssWidth, cssHeight, scrollWidth, charHeight, response['token']);
              Core.$apply(scope);
            },
            error: function (xhr, textStatus, error) {
              log.warn("Failed to log into terminal: ", error);
            },
            beforeSend: function (xhr) {
              xhr.setRequestHeader('Authorization', authHeader);
            }
          });

        }
      };
    }).run(function(workspace, viewRegistry, helpRegistry, layoutFull) {

      // tell the app to use the full layout, also could use layoutTree
      // to get the JMX tree or provide a URL to a custom layout
      viewRegistry[pluginName] = layoutFull;

      helpRegistry.addUserDoc('Terminal', Gogo.context + '/app/doc/help.md');

      // Set up top-level link to our plugin
      workspace.topLevelTabs.push({
        id: "karaf.terminal",
        content: "Terminal",
        title: "Open a terminal to the Karaf server",
        isValid: function () { return workspace.treeContainsDomainAndProperties("hawtio", {type: "plugin", name: "hawtio-karaf-terminal"}) },
        href: function() { return "#/gogo"; },
        isActive: function() { return workspace.isLinkActive("gogo"); }
      });

      var link = $("<link>");
      $("head").append(link);

      link.attr({
        rel: 'stylesheet',
        type: 'text/css',
        href: Gogo.context + '/css/gogo.css'
      });

    });

  // tell the hawtio plugin loader about our plugin so it can be
  // bootstrapped with the rest of angular
  hawtioPluginLoader.addModule(pluginName);

  return {
    GogoController: function($scope) {

      $scope.addToDashboardLink = function() {
        var href = "#/gogo";
        var size = angular.toJson({size_y: 4, size_x: 4});
        return "#/dashboard/add?tab=dashboard&href=" + encodeURIComponent(href) + "&size=" + encodeURIComponent(size);
      }
    }
  };

  return Gogo;
})(Gogo || {});
