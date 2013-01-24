module Fabric {

  export function ProfileController($scope, workspace:Workspace, $routeParams, jolokia) {
    $scope.versionId = $routeParams.versionId;
    $scope.profileId = $routeParams.profileId;
    
    if (angular.isDefined($scope.versionId) && angular.isDefined($scope.profileId)) {
      
      Core.register(jolokia, $scope, {
        type: 'exec', mbean: managerMBean,
        operation: 'getProfile(java.lang.String,java.lang.String)',
        arguments: [$scope.versionId, $scope.profileId]
      }, onSuccess(render));
      
    }
    
    function render(response) {
      if (!Object.equal($scope.row, response.value)) {
        $scope.row = response.value
        $scope.$apply();
      }
    }
  }
}
