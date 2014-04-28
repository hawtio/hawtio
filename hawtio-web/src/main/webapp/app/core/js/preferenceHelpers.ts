/**
 * @module Core
 */
module Core {

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
  export function configuredPluginsForPerspectiveId(perspectiveId, workspace, jolokia, localStorage) {

    // grab the top level tabs which is the plugins we can select as our default plugin
    var topLevelTabs = Perspective.topLevelTabsForPerspectiveId(workspace, perspectiveId);
    if (topLevelTabs && topLevelTabs.length > 0) {
      log.debug("Found " + topLevelTabs.length + " plugins");
      // exclude invalid tabs at first
      topLevelTabs = topLevelTabs.filter(tab => {
        var href = tab.href();
        return href && isValidFunction(workspace, tab.isValid);
      });
      log.debug("After filtering there are " + topLevelTabs.length + " plugins");

      var id = "plugins-" + perspectiveId;
      var initPlugins = parsePreferencesJson(localStorage[id], id);
      if (initPlugins) {
        // remove plugins which we cannot find active currently
        initPlugins = initPlugins.filter(p => {
          return topLevelTabs.some(tab => tab.id === p.id);
        });

        // add new active plugins which we didn't know about before
        topLevelTabs.forEach(tab => {
          var knownPlugin = initPlugins.some(p => p.id === tab.id);
          if (!knownPlugin) {
            log.info("Discovered new plugin in JVM since loading configuration: " + tab.id);
            initPlugins.push({id: tab.id, index: -1, displayName: tab.content, enabled: true, isDefault: false})
          }
        });
      } else {
        // okay no configured saved yet, so use what is active
        initPlugins = topLevelTabs;
      }
    }

    // okay push plugins to scope so we can see them in the UI
    var answer = safeTabsToPlugins(initPlugins);
    return answer;
  }

  /**
   * Function which safely can turn tabs/plugins to plugins
   */
  export function safeTabsToPlugins(tabs) {
    var answer = [];
    if (tabs) {
      tabs.forEach((tab, idx) => {
        var name;
        if (angular.isUndefined(tab.displayName)) {
          name = tab.content;
        } else {
          name = tab.displayName;
        }
        var enabled;
        if (angular.isUndefined(tab.enabled)) {
          enabled = true;
        } else {
          enabled = tab.enabled;
        }
        var isDefault;
        if (angular.isUndefined(tab.isDefault)) {
          isDefault = false;
        } else {
          isDefault = tab.isDefault;
        }
        answer.push({id: tab.id, index: idx, displayName: name, enabled: enabled, isDefault: isDefault});
      });
    }
    return answer;
  }

  export function filterTopLevelTabs(perspective, workspace, configuredPlugins) {
    var topLevelTabs = Perspective.topLevelTabsForPerspectiveId(workspace, perspective);
    if (perspective === "website") return topLevelTabs;

    // only include the tabs accordingly to configured
    var result = [];
    configuredPlugins.forEach(p => {
      if (p.enabled) {
        var pid = p.id;
        var tab = null;
        if (pid) {
          tab = topLevelTabs.find(t => t.id === pid);
        }
        if (tab) {
          result.push(tab);
        }
      }
    });
    return result;
  }

  export function initPreferenceScope($scope, localStorage, defaults) {
    angular.forEach(defaults, (_default, key) => {
      $scope[key] = _default['value'];
      var converter = _default['converter'];
      var formatter = _default['formatter'];
      if (!formatter) {
        formatter = (value) => { return value; };
      }
      if (!converter) {
        converter = (value) => { return value; };
      }
      if (key in localStorage) {
        var value = converter(localStorage[key]);
        Core.log.debug("from local storage, setting ", key, " to ", value);
        $scope[key] = value;
      } else {
        var value = _default['value'];
        Core.log.debug("from default, setting ", key, " to ", value);
        localStorage[key] = value;
      }

      var watchFunc = _default['override'];
      if (!watchFunc) {
        watchFunc = (newValue, oldValue) => {
          if (newValue !== oldValue) {
            if (angular.isFunction(_default['pre'])) {
              _default.pre(newValue);
            }

            var value = formatter(newValue);
            Core.log.debug("to local storage, setting ", key, " to ", value);
            localStorage[key] = value;

            if (angular.isFunction(_default['post'])) {
              _default.post(newValue);
            }
          }
        }
      }

      if (_default['compareAsObject']) {
        $scope.$watch(key, watchFunc, true);
      } else {
        $scope.$watch(key, watchFunc);
      }

    });


  }

  /**
   * Returns true if there is no validFn defined or if its defined
   * then the function returns true.
   *
   * @method isValidFunction
   * @for Perspective
   * @param {Core.Workspace} workspace
   * @param {Function} validFn
   * @return {Boolean}
   */
  export function isValidFunction(workspace, validFn) {
    return !validFn || validFn(workspace);
  }

  /**
   * Gets the default configured plugin for the given perspective, or <tt>null</tt> if no default has been configured.
   */
  export function getDefaultPlugin(perspectiveId, workspace, jolokia, localStorage) {
    var plugins = Core.configuredPluginsForPerspectiveId(perspectiveId, workspace, jolokia, localStorage);

    // find the default plugins
    var defaultPlugin = null;
    plugins.forEach(p => {
      if (p.isDefault) {
        defaultPlugin = p;
      }
    });
    return defaultPlugin;
  }

}

