/**
 * @module Core
 */
module Core {

  export var log:Logging.Logger = Logger.get("Preference");

  /**
   * Parsers the given value as JSON if it is define
   */
  export function parsePreferencesJson(value, key) {
    var answer = null;
    if (angular.isDefined(value)) {
      answer = Core.parseJsonText(value, "localStorage for " + key);
    }
    return answer;
  }

  /**
   * Function to return the configured plugin for the given perspective. The returned
   * list is sorted in the configured order.
   * Notice the list contains plugins which may have been configured as disabled.
   */
  export function configuredPluginsForPerspective(perspective, workspace, jolokia, localStorage) {

    // grab the top level tabs which is the plugins we can select as our default plugin
    var topLevelTabs = Perspective.topLevelTabsForPerspectiveId(workspace, perspective);
    if (topLevelTabs && topLevelTabs.length > 0) {
      log.debug("Found " + topLevelTabs.length + " plugins");
      // exclude invalid tabs at first
      topLevelTabs = topLevelTabs.filter(tab => {
        var href = tab.href();
        return href && Perspective.isValidFunction(workspace, tab.isValid);
      });
      log.debug("After filtering there are " + topLevelTabs.length + " plugins");

      var initPlugins = parsePreferencesJson(localStorage['plugins'], "plugins");
      if (initPlugins) {
        initPlugins.forEach((tab, idx) => {
          log.info("Configured plugin " + tab.id + " at " + tab.index + " loaded at index " + idx);
        });

        // remove plugins which we cannot find active currently
        initPlugins = initPlugins.filter(p => {
          return topLevelTabs.some(tab => tab.id === p.id);
        });

        // add new active plugins which we didn't know about before
        topLevelTabs.forEach(tab => {
          var knownPlugin = initPlugins.filter(p => {
            p.id === tab.id
          });
          if (!knownPlugin) {
            log.info("Found new plugin " + tab.id);
            initPlugins.push({id: tab.id, index: -1, displayName: tab.content, enabled: true, isDefault: false})
          }
        });

      } else {
        // okay no configured saved yet, so use what is active
        initPlugins = topLevelTabs;
      }
    }

    // okay push plugins to scope so we can see them in the UI
    var answer = [];
    if (initPlugins) {
      initPlugins.forEach((tab, idx) => {
        log.info("Plugin " + tab.id + " at " + idx);
        var name;
        if (tab.displayName) {
          name = tab.displayName;
        } else {
          name = tab.content;
        }
        answer.push({id: tab.id, index: idx, displayName: name, enabled: tab.enabled, isDefault: tab.isDefault});
      });
    }

    return answer;
  }

}

