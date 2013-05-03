module JVM {
  export function ConnectController($scope, $location, workspace) {

    JVM.configureScope($scope, $location, workspace);

    $scope.gotoServer = (url) => {
      console.log("going to server: " + url);

      var full = "?url=" + encodeURIComponent(url);

      if ($scope.userName) {
        full += "&_user=" + $scope.userName;
      }
      if ($scope.password) {
        full += "&pwd=" + $scope.password;
      }
      window.open();
    }
  }
}