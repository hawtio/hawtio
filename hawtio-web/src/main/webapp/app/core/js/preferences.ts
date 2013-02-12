module Core {

  export function PreferencesController($scope, workspace:Workspace, localStorage) {

    $scope.updateRate = localStorage['updateRate'];
    $scope.url = localStorage['url'];

    $scope.$watch('updateRate', () => {
      localStorage['updateRate'] = $scope.updateRate;
      $scope.$emit('UpdateRate', $scope.updateRate);
    });

    var names = ["gitUserName", "gitUserEmail"];
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
      window.open("#/?url=" + encodeURIComponent(url));
    }
  }
}
