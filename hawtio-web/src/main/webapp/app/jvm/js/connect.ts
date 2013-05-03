module JVM {
  export function ConnectController($scope, $location, workspace) {

    JVM.configureScope($scope, $location, workspace);

    $scope.host = "localhost";
    $scope.port = 8181;
    $scope.path = "jolokia";
    $scope.useProxy = true;
    $scope.userName = null;
    $scope.password = null;

    $scope.gotoServer = () => {
      var host = $scope.host || "localhost";
      var port = $scope.port || 80;
      var path = Core.trimLeading($scope.path || "jolokia", "/");
      var url = host + ":" + port + "/" + path;

      if ($scope.useProxy) {
        url = "/hawtio/proxy/" + url;
      }
      console.log("going to server: " + url + " as user " + $scope.userName);

      var full = "?url=" + encodeURIComponent(url);

      if ($scope.userName) {
        full += "&_user=" + $scope.userName;
      }
      if ($scope.password) {
        full += "&_pwd=" + $scope.password;
      }
      window.open(full);
    }
  }
}