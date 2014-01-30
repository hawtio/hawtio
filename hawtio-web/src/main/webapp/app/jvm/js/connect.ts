/**
 * @module Jvm
 */
module JVM {
  export function ConnectController($scope, $location, localStorage, workspace) {

    var log:Logging.Logger = Logger.get("JVM");

    JVM.configureScope($scope, $location, workspace);

    $scope.chromeApp = Core.isChromeApp();
    $scope.useProxy = $scope.chromeApp ? false : true;

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
    $scope.host = config["host"] || "localhost";
    $scope.path = config["path"] || "jolokia";
    $scope.port = config["port"] || 8181;
    $scope.userName = config["userName"];
    $scope.password = config["password"];

    // replicate changes to local storage
    angular.forEach(["userName", "password", "port", "path", "host"], (name) => {
      $scope.$watch(name, () => {
        var value = $scope[name];
        if (value) {
          config[name] = value;
          localStorage[key] = JSON.stringify(config);
        }
      });
    });

    $scope.gotoServer = () => {
      var options:Core.ConnectToServerOptions = new Core.ConnectToServerOptions();
      var host = $scope.host || 'localhost';

      // lets trim any http:// prefix or / postfix
      var idx = host.indexOf("://");
      if (idx >= 0) {
        host = host.substring(idx + 3);
      }
      idx = host.indexOf("/");
      if (idx >= 0) {
        host = host.substring(0, idx);
      }

      log.info("using host name: " + host + " and user: " + $scope.userName + " and password: " + ($scope.password ? "********" : $scope.password));
      options.host = host;
      options.port = $scope.port;
      options.path = $scope.path;
      options.userName = $scope.userName;
      options.password = $scope.password;
      options.useProxy = $scope.useProxy;

      Core.connectToServer(localStorage, options);
    }
  }
}
