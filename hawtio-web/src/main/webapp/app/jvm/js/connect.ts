module JVM {
  export function ConnectController($scope, $location, localStorage, workspace) {

    JVM.configureScope($scope, $location, workspace);

    $scope.host = "localhost";
    $scope.path = "jolokia";
    $scope.useProxy = true;

    // lets load the local storage configuration
    var key = "jvmConnect";
    var config = {};
    var configJson = localStorage[key];
    if (configJson) {
      try {
        config = JSON.parse(configJson);
      } catch (e) {
        // ignore
      }
    }
    $scope.port = config["port"] || 8181;
    $scope.userName = config["userName"];
    $scope.password = config["password"];

    // replicate changes to local storage
    angular.forEach(["userName", "password", "port"], (name) => {
      $scope.$watch(name, () => {
        var value = $scope[name];
        if (value) {
          config[name] = value;
          localStorage[key] = JSON.stringify(config);
        }
      });
    });

    $scope.gotoServer = () => {
      var host = $scope.host || "localhost";
      var port = $scope.port;
      var path = Core.trimLeading($scope.path || "jolokia", "/");
      path = Core.trimTrailing(path, "/");

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