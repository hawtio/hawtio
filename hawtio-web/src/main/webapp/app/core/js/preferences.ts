module Core {

  export function PreferencesController($scope, localStorage) {

    $scope.updateRate = localStorage['updateRate'];
    $scope.url = localStorage['url'];
    $scope.autoRefresh = localStorage['autoRefresh'] === "true";

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

    var names = ["gitUserName", "gitUserEmail", "activemqUserName", "activemqPassword"];
    angular.forEach(names, (name) => {
      $scope[name] =  localStorage[name] || "";
      $scope.$watch(name, () => {
        var value = $scope[name];
        if (value) {
          localStorage[name] = value;
        }
      });
    });

    $scope.gotoServer = (url) => {
      console.log("going to server: " + url);
      window.open("?url=" + encodeURIComponent(url));
    }
  }
}
