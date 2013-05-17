module Fabric {

  export function ProfileController($scope, $routeParams, jolokia, $location, workspace:Workspace) {
    Fabric.initScope($scope, workspace);

    $scope.versionId = $routeParams.versionId;
    $scope.profileId = $routeParams.profileId;

    $scope.newFileDialog = false;
    $scope.deleteFileDialog = false;
    $scope.newFileName = '';
    $scope.markedForDeletion = '';

    if (angular.isDefined($scope.versionId) && angular.isDefined($scope.profileId)) {
      Core.register(jolokia, $scope, {
        type: 'exec', mbean: managerMBean,
        operation: 'getProfile(java.lang.String,java.lang.String)',
        arguments: [$scope.versionId, $scope.profileId]
      }, onSuccess(render));
    }

    $scope.deleteFile = (file) => {
      $scope.markedForDeletion = file;
      $scope.deleteFileDialog = true;
    };

    $scope.doDeleteFile = () => {
      $scope.deleteFileDialog = false;
      deleteConfigFile(jolokia, $scope.versionId, $scope.profileId, $scope.markedForDeletion, () => {
        notification('success', 'Deleted file ' + $scope.markedForDeletion);
        $scope.markedForDeletion = '';
        $scope.$apply();
      }, (response) => {
        notification('error', 'Failed to delete file ' + $scope.markedForDeletion + ' due to ' + response.error);
        $scope.markedForDeletion = '';
        $scope.$apply();
      });
    };

    $scope.doCreateFile = () => {
      $scope.newFileDialog = false;
      newConfigFile(jolokia, $scope.versionId, $scope.profileId, $scope.newFileName, () => {
        notification('success', 'Created new configuration file ' + $scope.newFileName);
        $location.path("/fabric/profile/" + $scope.versionId + "/" + $scope.profileId + "/" + $scope.newFileName);
      }, (response) => {
        notification('error', 'Failed to create ' + $scope.newFileName + ' due to ' + response.error);
      })
    };
    
    function render(response) {
      if (!Object.equal($scope.row, response.value)) {
        $scope.row = response.value
        $scope.$apply();
      }
    }
  }
}
