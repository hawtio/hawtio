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
   * @property jmxDomain
   * @type {string}
   *
   * The JMX domain this plugin mostly works with
   */
  IRC.jmxDomain = "hawtio"

  /**
   * @property mbeanType
   * @type {string}
   *
   * The mbean type this plugin will work with
   */
  IRC.mbeanType = "IRCHandler";

  /**
   * @property mbean
   * @type {string}
   *
   * The mbean's full object name
   */
  IRC.mbean = IRC.jmxDomain + ":type=" + IRC.mbeanType;

  /**
   * @property SETTINGS_KEY
   * @type {string}
   *
   * The key used to fetch our settings from local storage
   */
  IRC.SETTINGS_KEY = 'IRCSettings';

  /**
   * @property module
   * @type {object}
   *
   * This plugin's angularjs module instance
   */
  IRC.module = angular.module(IRC.pluginName, ['hawtioCore', 'hawtio-ui', 'hawtio-forms', 'luegg.directives']);

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
  IRC.module.run(function(workspace, viewRegistry, localStorage, IRCService, $rootScope) {
    // let folks know we're actually running
    IRC.log.info("plugin running");

    Core.addCSS('../irc-plugin/plugin/css/plugin.css');

    // tell hawtio that we have our own custom layout for
    // our view
    viewRegistry["irc"] = IRC.templatePath + "ircLayout.html";

    // Add a top level tab to hawtio's navigation bar
    workspace.topLevelTabs.push({
      id: "irc",
      content: "IRC",
      title: "example IRC client",
      isValid: function(workspace) { return workspace.treeContainsDomainAndProperties(IRC.jmxDomain, { 'type': IRC.mbeanType }); },
      href: function() { return "#/irc/chat"; },
      isActive: function() { return workspace.isLinkActive("irc"); }
    });

    var settings = angular.fromJson(localStorage[IRC.SETTINGS_KEY]);
    if (settings && settings.autostart) {
      IRC.log.debug("Settings.autostart set, starting IRC connection");
      IRCService.addConnectAction(function() {
        Core.notification('info', "Connected to IRC Server");
        Core.$apply($rootScope);
      });
      IRCService.connect(settings);
    }

  });

  return IRC;
}(IRC || {}));

// Very important!  Add our module to hawtioPluginLoader so it
// bootstraps our module
hawtioPluginLoader.addModule(IRC.pluginName);

// have to add this third-party directive too
hawtioPluginLoader.addModule('luegg.directives');
