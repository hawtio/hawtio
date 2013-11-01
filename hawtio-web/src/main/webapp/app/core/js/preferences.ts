module Core {

  export function PreferencesController($scope, localStorage, userDetails, jolokiaUrl) {

    if (!angular.isDefined(localStorage['logLevel'])) {
      localStorage['logLevel'] = '{"value": 2, "name": "INFO"}';
    }

    $scope.localStorage = localStorage;

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

    $scope.hosts = [];
    $scope.newHost = {};

    $scope.addRegexDialog = false;

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

    $scope.$watch('hosts', (oldValue, newValue) => {
      if (!Object.equal(oldValue, newValue)) {
        if (angular.isDefined($scope.hosts)) {
          localStorage['regexs'] = angular.toJson($scope.hosts);
        } else {
          delete localStorage['regexs'];
        }
      } else {
        $scope.hosts = {};
        if (angular.isDefined(localStorage['regexs'])) {
          $scope.hosts = angular.fromJson(localStorage['regexs']);
        }
      }
    }, true);

    var defaults = {
      logCacheSize: 1000,
      fabricEnableMaps: true
    };

    var converters = {
      logCacheSize: parseInt,
      fabricEnableMaps: parseBooleanValue
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

    var names = ["gitUserName", "gitUserEmail", "activemqUserName", "activemqPassword", "logCacheSize", "fabricEnableMaps"];

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
          localStorage[name] = value;
        }
      });
    });

    console.log("logCacheSize " + $scope.logCacheSize);

    $scope.doReset = () => {
      logout(jolokiaUrl, userDetails, localStorage, $scope, () => {
        localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 10);
      });
    }
  }
}
