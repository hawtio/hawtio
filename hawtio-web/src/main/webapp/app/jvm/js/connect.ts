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
      var port = $scope.port;
      var path = Core.trimLeading($scope.path || "jolokia", "/");
      if (port > 0) {
        host += ":" + port;
      }
      var url = host + "/" + path;

      if ($scope.useProxy) {
        url = "/hawtio/proxy/" + url;
      } else {
        if (url.indexOf("://") < 0) {
          url = "http://" + url;
        }
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