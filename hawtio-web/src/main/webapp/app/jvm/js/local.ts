/**
 * @module JVM
 */
/// <reference path="./jvmPlugin.ts"/>
module JVM {

  _module.controller("JVM.JVMsController", ["$scope", "$window", "$location", "localStorage", "workspace", "jolokia", "mbeanName", ($scope, $window, $location, localStorage:WindowLocalStorage, workspace, jolokia, mbeanName) => {

    JVM.configureScope($scope, $location, workspace);
    $scope.data = [];
    $scope.deploying = false;
    $scope.status = '';

    $scope.fetch = () => {
      Core.notification('info', 'Discovering local JVM processes, please wait...');
      jolokia.request({
        type: 'exec', mbean: mbeanName,
        operation: 'listLocalJVMs()',
        arguments: []
      }, {
        success: render,
        error: (response) => {
          $scope.data = [];
          $scope.status = 'Could not discover local JVM processes: ' + response.error;
          Core.$apply($scope);
        }
      });
    };

    $scope.stopAgent = (pid) => {
      Core.notification('info', "Attempting to detach agent from PID " + pid);
      jolokia.request({
        type: 'exec', mbean: mbeanName,
        operation: 'stopAgent(java.lang.String)',
        arguments: [pid]
      }, onSuccess(function() {
        Core.notification('success', "Detached agent from PID " + pid);
        $scope.fetch()
      }));
    };

    $scope.startAgent = (pid) => {
      Core.notification('info', "Attempting to attach agent to PID " + pid);
      jolokia.request({
        type: 'exec', mbean: mbeanName,
        operation: 'startAgent(java.lang.String)',
        arguments: [pid]
      }, onSuccess(function() {
        Core.notification('success', "Attached agent to PID " + pid);
        $scope.fetch()
      }));
    };

    $scope.connectTo = (url, scheme, host, port, path) => {
      // we only need the port and path from the url, as we got the rest
      var options = {};
      options["scheme"] = scheme;
      options["host"] = host;
      options["port"] = port;
      options["path"] = path;
      // add empty username as we dont need login
      options["username"] = "";
      options["password"] = "";

      var con = Core.createConnectToServerOptions(options);
      con.name = "local";

      log.debug("Connecting to local JVM agent: " + url);
      Core.connectToServer(localStorage, con);
      Core.$apply($scope);
    };

    function render(response) {
      $scope.data = response.value
      if ($scope.data.length === 0) {
        $scope.status = 'Could not discover local JVM processes';
      }
      Core.$apply($scope);
    }

    $scope.fetch();
  }]);

}
