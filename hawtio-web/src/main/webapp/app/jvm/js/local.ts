/**
 * @module JVM
 */
module JVM {

  export function JVMsController($scope, $window, $location, workspace, jolokia, mbeanName) {

    JVM.configureScope($scope, $location, workspace);
    $scope.data = [];
    $scope.deploying = false;
    $scope.status = '';

    $scope.fetch = () => {
      notification('info', 'Discovering local JVM processes, please wait...');
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
    }

    $scope.stopAgent = (pid) => {
      notification('info', "Attempting to detach agent from PID " + pid);
      jolokia.request({
        type: 'exec', mbean: mbeanName,
        operation: 'stopAgent(java.lang.String)',
        arguments: [pid]
      }, onSuccess(function() {
        notification('success', "Detached agent from PID " + pid);
        $scope.fetch()
      }));
    }

    $scope.startAgent = (pid) => {
      notification('info', "Attempting to attach agent to PID " + pid);
      jolokia.request({
        type: 'exec', mbean: mbeanName,
        operation: 'startAgent(java.lang.String)',
        arguments: [pid]
      }, onSuccess(function() {
        notification('success', "Attached agent to PID " + pid);
        $scope.fetch()
      }));
    }

    $scope.connectTo = (url) => {
      $window.open("?url=" + encodeURIComponent(url));
    }


    function render(response) {
      $scope.data = response.value
      if ($scope.data.length === 0) {
        $scope.status = 'Could not discover local JVM processes';
      }
      Core.$apply($scope);
    }

    $scope.fetch();
  }


}
