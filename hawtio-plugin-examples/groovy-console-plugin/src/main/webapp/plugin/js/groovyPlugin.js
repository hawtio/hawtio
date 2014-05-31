/**
 * @module GroovyConsole
 * @mail GroovyConsole
 *
 * The main entry point for the GroovyConsole module
 *
 */
var GroovyConsole = (function(GroovyConsole) {

  /**
   * @property pluginName
   * @type {string}
   *
   * The name of this plugin
   */
  GroovyConsole.pluginName = 'groovy_console_plugin';

  /**
   * @property log
   * @type {Logging.Logger}
   *
   * This plugin's logger instance
   */
  GroovyConsole.log = Logger.get('GroovyConsole');

  /**
   * @property contextPath
   * @type {string}
   *
   * The top level path of this plugin on the server
   *
   */
  GroovyConsole.contextPath = "/groovy-console-plugin/";

  /**
   * @property templatePath
   * @type {string}
   *
   * The path to this plugin's partials
   */
  GroovyConsole.templatePath = GroovyConsole.contextPath + "plugin/html/";


  /**
   * The mbean for the groovy console
   */
  GroovyConsole.mbean = "hawtio:type=GroovyConsole";

  /**
   * @property module
   * @type {object}
   *
   * This plugin's angularjs module instance.  This plugin only
   * needs hawtioCore to run, which provides services like
   * workspace, viewRegistry and layoutFull used by the
   * run function
   */
  GroovyConsole.module = angular.module('groovy_console_plugin', ['hawtioCore'])
      .config(function($routeProvider) {

        /**
         * Here we define the route for our plugin.  One note is
         * to avoid using 'otherwise', as hawtio has a handler
         * in place when a route doesn't match any routes that
         * routeProvider has been configured with.
         */
        $routeProvider.
            when('/groovy_console_plugin', {
              templateUrl: GroovyConsole.templatePath + 'console.html'
            });
      });

  /**
   * Here we define any initialization to be done when this angular
   * module is bootstrapped.  In here we do a number of things:
   *
   * 1.  We log that we've been loaded (kinda optional)
   * 2.  We load our .css file for our views
   * 3.  We configure the viewRegistry service from hawtio for our
   *     route; in this case we use a pre-defined layout that uses
   *     the full viewing area
   * 4.  We configure our top-level tab and provide a link to our
   *     plugin.  This is just a matter of adding to the workspace's
   *     topLevelTabs array.
   */
  GroovyConsole.module.run(function(workspace, viewRegistry, layoutFull) {

    GroovyConsole.log.info(GroovyConsole.pluginName, " loaded");

    Core.addCSS(GroovyConsole.contextPath + "plugin/css/groovy.css");

    // tell the app to use the full layout, also could use layoutTree
    // to get the JMX tree or provide a URL to a custom layout
    viewRegistry["groovy_console_plugin"] = layoutFull;

    /* Set up top-level link to our plugin.  Requires an object
       with the following attributes:

         id - the ID of this plugin, used by the perspective plugin
              and by the preferences page
         content - The text or HTML that should be shown in the tab
         title - This will be the tab's tooltip
         isValid - A function that returns whether or not this
                   plugin has functionality that can be used for
                   the current JVM.  The workspace object is passed
                   in by hawtio's navbar controller which lets
                   you inspect the JMX tree, however you can do
                   any checking necessary and return a boolean
         href - a function that returns a link, normally you'd
                return a hash link like #/foo/bar but you can
                also return a full URL to some other site
         isActive - Called by hawtio's navbar to see if the current
                    $location.url() matches up with this plugin.
                    Here we use a helper from workspace that
                    checks if $location.url() starts with our
                    route.
     */
    workspace.topLevelTabs.push({
      id: "groovy-console",
      content: "Groovy Console",
      title: "GroovyConsole plugin loaded dynamically",
      isValid: function(workspace) { return true; },
      href: function() { return "#/groovy_console_plugin"; },
      isActive: function(workspace) { return workspace.isLinkActive("groovy_console_plugin"); }
    });

  });

  /**
   * @function GroovyController
   * @param $scope
   * @param jolokia
   *
   * The controller for console.html, only requires the jolokia
   * service from hawtioCore
   */
  GroovyConsole.GroovyController = function($scope, jolokia) {

    $scope.groovyinput = null;

    $scope.evalMe = function() {
      GroovyConsole.log.info(GroovyConsole.pluginName, " evaluate(" + $scope.groovyinput + ")");
      if ($scope.groovyinput) {
        // call mbean
        jolokia.request({
          type: 'exec',
          mbean: GroovyConsole.mbean,
          operation: 'evaluate',
          arguments: [$scope.groovyinput]
        }, onSuccess(render, {error: renderError}));
      }
    }

    // update display with groovy result
    function render(response) {
      GroovyConsole.log.info(GroovyConsole.pluginName, " --> " + response.value);
      $scope.output = response.value;
      $scope.error = null;
      Core.$apply($scope);
    }

    function renderError(response) {
      GroovyConsole.log.info(GroovyConsole.pluginName, " error " + response);
      $scope.output = null;
      $scope.error = response;
      Core.$apply($scope);
    }
  };

  return GroovyConsole;

})(GroovyConsole || {});

// tell the hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of angular
hawtioPluginLoader.addModule(GroovyConsole.pluginName);
