
var IRC = (function(IRC) {

  IRC.pluginName = "IRC";
  IRC.log = Logger.get(IRC.pluginName);
  IRC.templatePath = "../irc-plugin/plugin/html/";

  IRC.module = angular.module(IRC.pluginName, ['hawtioCore', 'hawtio-ui']);
  IRC.module.config(function($routeProvider) {
    $routeProvider.when('/irc', {
      templateUrl: IRC.templatePath + 'irc.html'
    });
  });
  IRC.module.run(function(workspace, viewRegistry) {
    IRC.log.info("plugin running");

    viewRegistry["irc"] = IRC.templatePath + "ircLayout.html";

    workspace.topLevelTabs.push({
      id: "irc",
      content: "IRC",
      title: "example IRC client",
      isValid: function() { return true; },
      href: function() { return "#/irc"; },
      isActive: function() { return workspace.isLinkActive("irc"); }
    });

  });

  return IRC;
}(IRC || {}));

hawtioPluginLoader.addModule(IRC.pluginName);
