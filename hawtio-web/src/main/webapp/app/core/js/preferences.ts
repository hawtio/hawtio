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

    $scope.currentTheme = Themes.current;
    $scope.availableThemes = Themes.getAvailable();

    $scope.$watch('currentTheme', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        Themes.setTheme(newValue, branding);
      }
    });

    $scope.branding = branding;

    if (!angular.isDefined(localStorage['logLevel'])) {
      localStorage['logLevel'] = '{"value": 2, "name": "INFO"}';
    }

    $scope.localStorage = localStorage;

    Core.bindModelToSearchParam($scope, $location, "pref", "pref", "core-preference");

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
    $scope.activemqFilterAdvisoryTopics = localStorage['activemqFilterAdvisoryTopics'] === "true";

    $scope.hosts = [];
    $scope.newHost = {};

    $scope.addRegexDialog = new UI.Dialog();
    $scope.forms = {};

    $scope.perspectiveId;
    $scope.perspectives = [];

    // used by add dialog in preference.html
    $scope.hostSchema = {
      properties: {
        'name': {
          description: 'Indicator name',
          type: 'string',
          required: true
        },
        'regex': {
          description: 'Indicator regex',
          type: 'string',
          required: true
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

    $scope.onOk = (json, form) => {
      $scope.addRegexDialog.close();
      $scope.newHost['color'] = UI.colors.sample();
      if (!angular.isArray($scope.hosts)) {
        $scope.hosts = [Object.clone($scope.newHost)];
      } else {
        $scope.hosts.push(Object.clone($scope.newHost));
      }

      $scope.newHost = {};
      Core.$apply($scope);
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
        log.debug("Saving plugin settings for perspective " + $scope.perspectiveId + " -> " + json);
        var id = "plugins-" + $scope.perspectiveId;
        localStorage[id] = json;
      }

      // force UI to update by reloading the page which works
      setTimeout(() => {
        window.location.reload();
      }, 10);
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
      showWelcomePage: true,
      logCacheSize: 1000,
      logSortAsc: true,
      logAutoScroll: true,
      fabricAlwaysPrompt: false,
      fabricEnableMaps: true,
      fabricVerboseNotifications: false,
      camelIgnoreIdForLabel: false,
      camelMaximumLabelWidth: Camel.defaultMaximumLabelWidth,
      camelMaximumTraceOrDebugBodyLength: Camel.defaultCamelMaximumTraceOrDebugBodyLength,
      activemqBrowseBytesMessages: 1,
      activemqFilterAdvisoryTopics: false
    };

    var converters = {
      showWelcomePage: parseBooleanValue,
      logCacheSize: parseInt,
      logSortAsc: parseBooleanValue,
      logAutoScroll: parseBooleanValue,
      fabricAlwaysPrompt: parseBooleanValue,
      fabricEnableMaps: parseBooleanValue,
      fabricVerboseNotifications: parseBooleanValue,
      camelIgnoreIdForLabel: parseBooleanValue,
      camelMaximumLabelWidth: parseInt,
      camelMaximumTraceOrDebugBodyLength: parseInt,
      activemqBrowseBytesMessages: parseInt,
      activemqFilterAdvisoryTopics: parseBooleanValue
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

    $scope.$watch('activemqFilterAdvisoryTopics', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      localStorage['activemqFilterAdvisoryTopics'] = $scope.activemqFilterAdvisoryTopics;

      // need to trigger JMX tree updated event so the ActiveMQ plugin tree can be updated whether advisory topics should be in the tree or not
      var rootScope = workspace.$rootScope;
      if (rootScope) {
        rootScope.$broadcast('jmxTreeUpdated');
      }
    });

    var names = ["showWelcomePage", "gitUserName", "gitUserEmail", "activemqUserName", "activemqPassword", "activemqBrowseBytesMessages", "activemqFilterAdvisoryTopics",
      "logCacheSize", "logSortAsc", "logAutoScroll", "fabricAlwaysPrompt", "fabricEnableMaps", "fabricVerboseNotifications", "camelIgnoreIdForLabel", "camelMaximumLabelWidth",
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

    $scope.doClearConnectSettings = () => {
      var doReset = () => {
        delete localStorage[JVM.connectControllerKey];
        delete localStorage[JVM.connectionSettingsKey];
        setTimeout(() => {
          window.location.reload();
        }, 10);
      };
      doReset();
    };

    $scope.$watch('perspectiveId', (newValue, oldValue) => {
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
      var plugins = Core.configuredPluginsForPerspectiveId(perspective.id, workspace, jolokia, localStorage);
      $scope.plugins = plugins;
      $scope.perspectiveId = perspective.id;
      log.debug("Updated to perspective " + $scope.perspectiveId + " with " + plugins.length + " plugins");
    }

    // initialize the controller, and pick the 1st perspective
    $scope.perspectives = Perspective.getPerspectives($location, workspace, jolokia, localStorage);
    log.debug("There are " + $scope.perspectives.length + " perspectives");

    // pick the current selected perspective
    var selectPerspective;
    var perspectiveId = Perspective.currentPerspectiveId($location, workspace, jolokia, localStorage);
    if (perspectiveId) {
      selectPerspective = $scope.perspectives.find(p => p.id === perspectiveId);
    }
    if (!selectPerspective) {
      // just pick the 1st then
      selectPerspective = $scope.perspectives[0];
    }

    updateToPerspective(selectPerspective);
    // and force update the ui
    Core.$apply($scope);
  }

}
