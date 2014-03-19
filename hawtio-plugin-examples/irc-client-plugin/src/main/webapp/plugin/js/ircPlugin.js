/**
 * @module IRC
 * @main IRC
 *
 * The main entrypoint for the IRC module
 *
 */
var IRC = (function(IRC) {

  /**
   * @property pluginName
   * @type {string}
   *
   * The name of this plugin
   */
  IRC.pluginName = "IRC";

  /**
   * @property log
   * @type {Logging.Logger}
   *
   * This plugin's logger instance
   */
  IRC.log = Logger.get(IRC.pluginName);

  /**
   * @property templatePath
   * @type {string}
   *
   * The top level path to this plugin's partials
   */
  IRC.templatePath = "../irc-plugin/plugin/html/";

  /**
   * @property module
   * @type {object}
   *
   * This plugin's angularjs module instance
   */
  IRC.module = angular.module(IRC.pluginName, ['hawtioCore', 'hawtio-ui']);

  // set up the routing for this plugin
  IRC.module.config(function($routeProvider) {
    $routeProvider
        .when('/irc/chat', {
          templateUrl: IRC.templatePath + 'irc.html'
        })
        .when('/irc/settings', {
          templateUrl: IRC.templatePath + 'settings.html'
        });
  });

  // one-time initialization happens in the run function
  // of our module
  IRC.module.run(function(workspace, viewRegistry) {
    // let folks know we're actually running
    IRC.log.info("plugin running");

    // tell hawtio that we have our own custom layout for
    // our view
    viewRegistry["irc"] = IRC.templatePath + "ircLayout.html";

    // Add a top level tab to hawtio's navigation bar
    workspace.topLevelTabs.push({
      id: "irc",
      content: "IRC",
      title: "example IRC client",
      isValid: function() { return true; },
      href: function() { return "#/irc/chat"; },
      isActive: function() { return workspace.isLinkActive("irc"); }
    });

  });

  return IRC;
}(IRC || {}));

// Very important!  Add our module to hawtioPluginLoader so it
// bootstraps our module
hawtioPluginLoader.addModule(IRC.pluginName);
