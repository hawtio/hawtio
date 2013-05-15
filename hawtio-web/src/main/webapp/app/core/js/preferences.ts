module Core {

  export function PreferencesController($scope, localStorage) {

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
    }

    $scope.moveUp = (index) => {
      var tmp = $scope.hosts[index];
      $scope.hosts[index] = $scope.hosts[index - 1];
      $scope.hosts[index - 1] = tmp
    }

    $scope.moveDown = (index) => {
      var tmp = $scope.hosts[index];
      $scope.hosts[index] = $scope.hosts[index + 1];
      $scope.hosts[index + 1] = tmp
    }

    $scope.onOk = () => {
      $scope.newHost['color'] = UI.colors.sample();
      if (!angular.isArray($scope.hosts)) {
        $scope.hosts = [Object.clone($scope.newHost)];
      } else {
        $scope.hosts.push(Object.clone($scope.newHost));
      }

      $scope.newHost = {};
    }

    $scope.$watch('hosts', (oldValue, newValue) => {
      if (!Object.equal(oldValue, newValue)) {
        localStorage['regexs'] = angular.toJson($scope.hosts);
      } else {
        $scope.hosts = angular.fromJson(localStorage['regexs']);
      }
    }, true);

    var defaults = {
      logCacheSize: 1000
    };

    var converters = {
      logCacheSize: parseInt
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

    var names = ["gitUserName", "gitUserEmail", "activemqUserName", "activemqPassword", "logCacheSize"];

    angular.forEach(names, (name) => {
      $scope[name] = localStorage[name];
      var converter = converters[name];
      if (converter) {
        $scope[name] = converter($scope[name]);
      }
      if (!$scope[name]) {
        $scope[name] = defaults[name] || "";
      }

      $scope.$watch(name, () => {
        var value = $scope[name];
        if (value) {
          localStorage[name] = value;
        }
      });
    });

    console.log("logCacheSize " + $scope.logCacheSize);
  }
}
