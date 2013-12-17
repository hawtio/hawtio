/**
 * @module Core
 */
module Core {

  export function PreferencesController($scope, $location, jolokia, workspace, localStorage, userDetails, jolokiaUrl, branding) {

    var log:Logging.Logger = Logger.get("Preference");

    /**
     * Parsers the given value as JSON if it is define
     */
    function parsePreferencesJson(value, key) {
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
    function configuredPluginsForPerspective(perspective, workspace, jolokia, localStorage) {

      // grab the top level tabs which is the plugins we can select as our default plugin
      var topLevelTabs = Perspective.topLevelTabsForPerspectiveId(workspace, perspective.id);
      if (topLevelTabs && topLevelTabs.length > 0) {
        log.debug("Found " + topLevelTabs.length + " plugins");
        // exclude invalid tabs at first
        topLevelTabs = topLevelTabs.filter(tab => {
          var href = tab.href();
          return href && Core.isValidFunction(workspace, tab.isValid);
        });

        var id = "plugins-" + perspective.id;
        var initPlugins = parsePreferencesJson(localStorage[id], id);
        if (initPlugins) {
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
              log.info("Discovered new plugin in JVM which was not in preference configuration: " + tab.id);
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

    $scope.branding = branding;

    if (!angular.isDefined(localStorage['logLevel'])) {
      localStorage['logLevel'] = '{"value": 2, "name": "INFO"}';
    }

    $scope.localStorage = localStorage;

    Core.bindModelToSearchParam($scope, $location, "pref", "pref", "behaviour");

    $scope.logBuffer = 0;
    if ('logBuffer' in localStorage) {
      $scope.logBuffer = parseInt(localStorage['logBuffer']);
    }

    $scope.$watch('localStorage.logLevel', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        var level = JSON.parse(newValue);
        Logger.setLevel(level);
      }
    });

    $scope.$watch('logBuffer', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        localStorage['logBuffer'] = newValue;
        window['LogBuffer'] = newValue;
      }
    });

    $scope.updateRate = localStorage['updateRate'];
    $scope.url = localStorage['url'];
    $scope.autoRefresh = localStorage['autoRefresh'] === "true";
    $scope.showWelcomePage = localStorage['showWelcomePage'] === "true";

    $scope.hosts = [];
    $scope.newHost = {};

    $scope.addRegexDialog = false;
    $scope.perspective;
    $scope.perspectives = [];

    $scope.hostSchema = {
      properties: {
        'name': {
          description: 'Indicator name',
          type: 'string'
        },
        'regex': {
          description: 'Indicator regex',
          type: 'string'
        }
      }
    };

    $scope.pluginSchema = {
      properties: {
        'id': {
          description: 'Plugin id',
          type: 'string'
        },
        'displayName': {
          description: 'Plugin name',
          type: 'string'
        },
        'index': {
          description: 'Plugin index',
          type: 'integer'
        },
        'enabled': {
          description: 'Plugin enabled',
          type: 'boolean'
        },
        'isDefault': {
          description: 'Plugin is default',
          type: 'boolean'
        }
      }
    };

    $scope.delete = (index) => {
      $scope.hosts.removeAt(index);
    };

    $scope.moveUp = (index) => {
      var tmp = $scope.hosts[index];
      $scope.hosts[index] = $scope.hosts[index - 1];
      $scope.hosts[index - 1] = tmp
    };

    $scope.moveDown = (index) => {
      var tmp = $scope.hosts[index];
      $scope.hosts[index] = $scope.hosts[index + 1];
      $scope.hosts[index + 1] = tmp
    };

    $scope.onOk = () => {
      $scope.newHost['color'] = UI.colors.sample();
      if (!angular.isArray($scope.hosts)) {
        $scope.hosts = [Object.clone($scope.newHost)];
      } else {
        $scope.hosts.push(Object.clone($scope.newHost));
      }

      $scope.newHost = {};
    };

    $scope.plugins = [];
    $scope.pluginDirty = false;

    $scope.pluginMoveUp = (index) => {
      $scope.pluginDirty = true;
      var tmp = $scope.plugins[index];
      $scope.plugins[index] = $scope.plugins[index - 1];
      $scope.plugins[index - 1] = tmp
    };

    $scope.pluginMoveDown = (index) => {
      $scope.pluginDirty = true;
      var tmp = $scope.plugins[index];
      $scope.plugins[index] = $scope.plugins[index + 1];
      $scope.plugins[index + 1] = tmp
    };

    $scope.pluginDisable = (index) => {
      $scope.pluginDirty = true;
      $scope.plugins[index].enabled = false;
      $scope.plugins[index].isDefault = false;
    };

    $scope.pluginEnable = (index) => {
      $scope.pluginDirty = true;
      $scope.plugins[index].enabled = true;
    };

    $scope.pluginDefault = (index) => {
      $scope.pluginDirty = true;
      $scope.plugins.forEach((p) => {
        p.isDefault = false;
      });
      $scope.plugins[index].isDefault = true;
    };

    $scope.pluginApply = () => {
      $scope.pluginDirty = false;

      // set index before saving
      $scope.plugins.forEach((p, idx) => {
        p.index = idx;
      });

      var json = angular.toJson($scope.plugins);
      if (json) {
        log.info("Saving plugin settings for perspective " + $scope.perspective.id + " -> " + json);
        var id = "plugins-" + $scope.perspective.id;
        localStorage[id] = json;
      }

      // TODO: force navbar to be updated as its changed (current code not working)
      var $rootScope = $scope.$root || $scope.$rootScope || $scope;
      if ($rootScope) {
        log.info("Using " + $rootScope + " to broadcast");
        $rootScope.$broadcast('jmxTreeUpdated');
      }

      Core.$apply($scope);
    }

    $scope.$watch('hosts', (oldValue, newValue) => {
      if (!Object.equal(oldValue, newValue)) {
        if (angular.isDefined($scope.hosts)) {
          localStorage['regexs'] = angular.toJson($scope.hosts);
        } else {
          delete localStorage['regexs'];
        }
      } else {
        $scope.hosts = parsePreferencesJson(localStorage['regexs'], "hosts") || {};
      }
    }, true);

    var defaults = {
      logCacheSize: 1000,
      logSortAsc: true,
      logAutoScroll: true,
      fabricAlwaysPrompt: false,
      fabricEnableMaps: true,
      camelIgnoreIdForLabel: false,
      camelMaximumLabelWidth: Camel.defaultMaximumLabelWidth,
      camelMaximumTraceOrDebugBodyLength: Camel.defaultCamelMaximumTraceOrDebugBodyLength
    };

    var converters = {
      logCacheSize: parseInt,
      logSortAsc: parseBooleanValue,
      logAutoScroll: parseBooleanValue,
      fabricAlwaysPrompt: parseBooleanValue,
      fabricEnableMaps: parseBooleanValue,
      camelIgnoreIdForLabel: parseBooleanValue,
      camelMaximumLabelWidth: parseInt,
      camelMaximumTraceOrDebugBodyLength: parseInt
    };

    $scope.$watch('updateRate', () => {
      localStorage['updateRate'] = $scope.updateRate;
      $scope.$emit('UpdateRate', $scope.updateRate);
    });

    $scope.$watch('autoRefresh', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      localStorage['autoRefresh'] = $scope.autoRefresh;
    });

    $scope.$watch('showWelcomePage', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      localStorage['showWelcomePage'] = $scope.showWelcomePage;
    });

    var names = ["showWelcomePage", "gitUserName", "gitUserEmail", "activemqUserName", "activemqPassword",
      "logCacheSize", "logSortAsc", "logAutoScroll", "fabricAlwaysPrompt", "fabricEnableMaps", "camelIgnoreIdForLabel", "camelMaximumLabelWidth",
      "camelMaximumTraceOrDebugBodyLength"];

    angular.forEach(names, (name) => {
      if (angular.isDefined(localStorage[name])) {
        $scope[name] = localStorage[name];
        var converter = converters[name];
        if (converter) {
          $scope[name] = converter($scope[name]);
        }
      } else {
        $scope[name] = defaults[name] || "";
      }

      $scope.$watch(name, () => {
        var value = $scope[name];
        if (angular.isDefined(value)) {
          var actualValue = value;
          var converter = converters[name];
          if (converter) {
            actualValue = converter(value);
          }
          localStorage[name] = actualValue;
        }
      });
    });

    $scope.doReset = () => {

      log.info("Resetting");

      var doReset = () => {
        localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 10);
      };
      if (Core.isBlank(userDetails.username) && Core.isBlank(userDetails.password)) {
        doReset();
      } else {
        logout(jolokiaUrl, userDetails, localStorage, $scope, doReset);
      }
    };

    $scope.$watch('perspective', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      var perspective = Perspective.getPerspectiveById(newValue);
      if (perspective) {
        updateToPerspective(perspective);
        Core.$apply($scope);
      }
    });

    function updateToPerspective(perspective) {
      var plugins = configuredPluginsForPerspective(perspective, workspace, jolokia, localStorage);
      $scope.plugins = plugins;
      $scope.perspective = perspective;

      log.info("Updated to perspective " + perspective.id + " with " + plugins.length + " plugins");
    }

    // initialize the controller, and pick the 1st perspective
    $scope.perspectives = Perspective.getPerspectives($location, workspace, jolokia, localStorage);
    updateToPerspective($scope.perspectives[0]);
    // and force update the ui
    Core.$apply($scope);
  }

}
