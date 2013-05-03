module Fabric {

  export function ContainerController($scope, workspace:Workspace, $routeParams, jolokia) {
    $scope.containerId = $routeParams.containerId;
    
    if (angular.isDefined($scope.containerId)) {
      
      Core.register(jolokia, $scope, {
          type: 'exec', mbean: managerMBean,
          operation: 'getContainer(java.lang.String)',
          arguments: [$scope.containerId]
      }, onSuccess(render));
      
    }

    $scope.stop = () => {
      // TODO proper notifications
      stopContainer(jolokia, $scope.containerId, function() {console.log("Stopped!")}, function() {console.log("Failed to stop!")});
    };

    $scope.delete = () => {
      // TODO proper notifications
      destroyContainer(jolokia, $scope.containerId, function() {console.log("Deleted!")}, function() {console.log("Failed to delete!")});
    };

    $scope.start = () => {
      // TODO proper notifications
      startContainer(jolokia, $scope.containerId, function() {console.log("Started!")}, function() {console.log("Failed to start!")});
    };

    $scope.getType = () => {
      if ($scope.row) {
        if ($scope.row.ensembleServer) {
          return "Fabric Server";
        } else if ($scope.row.managed) {
          return "Managed Container";
        } else {
          return "Unmanaged Container";
        }
      }
      return "";
    };


    function render(response) {
      if (!Object.equal($scope.row, response.value)) {
        $scope.row = response.value;
        $scope.services = getServiceList($scope.row);
        $scope.$apply();
      }
    }
 }
}
