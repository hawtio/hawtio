module Fabric {
  export function PatchingController($scope, jolokia) {

    $scope.files = [];
    $scope.targetVersion = null;

    $scope.$watch('targetVersion', (newValue, oldValue) => {
      console.log("targetVersion: ", $scope.targetVersion);
    });

  }
}
