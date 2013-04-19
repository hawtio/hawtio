module JVM {

  export function JVMsController($scope, $window, jolokia, mbeanName) {

    $scope.data = [];


    $scope.fetch = () => {
      jolokia.request({
        type: 'exec', mbean: mbeanName,
        operation: 'listLocalJVMs()',
        arguments: []
      }, onSuccess(render));
    }

    $scope.stopAgent = (pid) => {
      jolokia.request({
        type: 'exec', mbean: mbeanName,
        operation: 'stopAgent(java.lang.String)',
        arguments: [pid]
      }, onSuccess($scope.fetch));
    }

    $scope.startAgent = (pid) => {
      jolokia.request({
        type: 'exec', mbean: mbeanName,
        operation: 'startAgent(java.lang.String)',
        arguments: [pid]
      }, onSuccess($scope.fetch));
    }

    $scope.connectTo = (url) => {
      $window.open("?url=" + encodeURIComponent(url));
    }


    function render(response) {
      console.log("Got: ", response);
      $scope.data = response.value
      $scope.$apply();
    }

    $scope.fetch();
  }


}
