/**
 * @module GroovyShell
 * @mail GroovyShell
 *
 * The main entry point for the GroovyShell module
 *
 */
var GroovyShell = (function(GroovyShell) {

  /**
   * @property pluginName
   * @type {string}
   *
   * The name of this plugin
   */
  GroovyShell.pluginName = 'groovy_shell_plugin';

  /**
   * @property log
   * @type {Logging.Logger}
   *
   * This plugin's logger instance
   */
  GroovyShell.log = Logger.get('GroovyShell');

  /**
   * @property contextPath
   * @type {string}
   *
   * The top level path of this plugin on the server
   *
   */
  GroovyShell.contextPath = "/groovy-shell-plugin/";

  /**
   * @property templatePath
   * @type {string}
   *
   * The path to this plugin's partials
   */
  GroovyShell.templatePath = GroovyShell.contextPath + "plugin/html/";


  /**
   * The mbean for the groovy shell
   */
  GroovyShell.mbean = "hawtio:type=GroovyShell";

  /**
   * @property module
   * @type {object}
   *
   * This plugin's angularjs module instance.  This plugin only
   * needs hawtioCore to run, which provides services like
   * workspace, viewRegistry and layoutFull used by the
   * run function
   */
  GroovyShell.module = angular.module('groovy_shell_plugin', ['hawtioCore'])
      .config(function($routeProvider) {

        /**
         * Here we define the route for our plugin.  One note is
         * to avoid using 'otherwise', as hawtio has a handler
         * in place when a route doesn't match any routes that
         * routeProvider has been configured with.
         */
        $routeProvider.
            when('/groovy_shell_plugin', {
              templateUrl: GroovyShell.templatePath + 'shell.html'
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
   * 4.  We add our help to the help registry
   * 5.  We configure our top-level tab and provide a link to our
   *     plugin.  This is just a matter of adding to the workspace's
   *     topLevelTabs array.
   */
  GroovyShell.module.run(function(workspace, viewRegistry, helpRegistry, layoutFull) {

    GroovyShell.log.info(GroovyShell.pluginName, " loaded");

    Core.addCSS(GroovyShell.contextPath + "plugin/css/groovy.css");

    // tell the app to use the full layout, also could use layoutTree
    // to get the JMX tree or provide a URL to a custom layout
    viewRegistry["groovy_shell_plugin"] = layoutFull;

    // add the plugin help to the help registry
    helpRegistry.addUserDoc('Groovy-Shell', GroovyShell.contextPath + '/plugin/doc/help.md');

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
      id: "groovy-shell",
      content: "Groovy Shell",
      title: "GroovyShell plugin loaded dynamically",
      isValid: function(workspace) { return true; },
      href: function() { return "#/groovy_shell_plugin"; },
      isActive: function(workspace) { return workspace.isLinkActive("groovy_shell_plugin"); }
    });

  });

  /**
   * @function GroovyController
   * @param $scope
   * @param jolokia
   *
   * The controller for shell.html, only requires the jolokia
   * service from hawtioCore
   */
  GroovyShell.GroovyController = function($scope, jolokia) {

    $scope.groovyinput = null;

    $scope.evalMe = function() {
      GroovyShell.log.info(GroovyShell.pluginName, " evaluate(" + $scope.groovyinput + ")");
      if ($scope.groovyinput) {
        // call mbean
        jolokia.request({
          type: 'exec',
          mbean: GroovyShell.mbean,
          operation: 'evaluate',
          arguments: [$scope.groovyinput]
        }, onSuccess(render, {error: renderError}));
      }
    }

    // update display with groovy result
    function render(response) {
      GroovyShell.log.info(GroovyShell.pluginName, " --> " + response.value);
      $scope.output = response.value;
      $scope.error = null;
      Core.$apply($scope);
    }

    function renderError(response) {
      GroovyShell.log.info(GroovyShell.pluginName, " error " + response);
      $scope.output = null;
      $scope.error = response;
      Core.$apply($scope);
    }
  };

  return GroovyShell;

})(GroovyShell || {});

// tell the hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of angular
hawtioPluginLoader.addModule(GroovyShell.pluginName);
