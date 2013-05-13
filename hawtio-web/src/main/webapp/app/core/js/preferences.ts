module Core {

  export function PreferencesController($scope, localStorage) {

    $scope.updateRate = localStorage['updateRate'];
    $scope.url = localStorage['url'];
    $scope.autoRefresh = localStorage['autoRefresh'] === "true";

    var defaults = {
      logCacheSize: 1000
    };

    var converters = {
      logCacheSize: parseInt
    };

    console.log("AutoRefresh", $scope.autoRefresh);

    $scope.$watch('updateRate', () => {
      localStorage['updateRate'] = $scope.updateRate;
      $scope.$emit('UpdateRate', $scope.updateRate);
    });

    $scope.$watch('autoRefresh', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      localStorage['autoRefresh'] = $scope.autoRefresh;
      console.log("AutoRefresh", $scope.autoRefresh);
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
