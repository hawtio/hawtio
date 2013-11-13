

var CustomPerspective = (function() {

  /**
   * Initialize the plugin and create a logger for it so it's easy to find it's log
   * statements in the console
   */
  var pluginName = "CustomPerspective";
  var log = Logger.get(pluginName);
  var plugin = angular.module(pluginName, ['perspective']);

  /**
   * The plugin's main entry point.
   */
  plugin.run( function(workspace) {
    log.info("Custom perspective plugin installed");

    log.debug("Current metadata: ", window['Perspective']['metadata']);
    log.debug("Top level tabs:");

    workspace.topLevelTabs.forEach(function(tab) {
      log.debug("Tab content:", tab['content'], " id: ", tab['id'], " href: ", tab.href());
    });

    /**
     * By default tabs are pulled from the "container" perspective, here
     * we can define includes or excludes to customize the available tabs
     * in hawtio.  Use "href" to match from the start of a URL and "rhref"
     * to match a URL via regex string.
     */
    window['Perspective']['metadata'] = {
      container: {
        label: "Container",
        lastPage: "#/help",
        topLevelTabs: {
          excludes: [
            {
              href: "#/dashboard"
            },
            {
              href: "#/jvm"
            }
          ]
        }
      }
    };

    log.debug("Perspective definition now: ", window['Perspective']['metadata']);

  });

  hawtioPluginLoader.addModule(pluginName);

})();
