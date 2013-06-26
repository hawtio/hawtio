module Fabric {

  export class VersionSelector {

    public restrict = 'A';
    public replace = true;
    public templateUrl = Fabric.templatePath + "versionSelector.html";


    public scope = {
      selectedVersion: '=fabricVersionSelector'
    };


    public controller = ($scope, $element, $attrs, jolokia) => {
      $scope.versions = [];
      $scope.responseJson = '';


      $scope.$watch('versions', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if (!$scope.selectedVersion) {
            $scope.selectedVersion = $scope.versions.find((version) => { return version.defaultVersion; });
          } else {
            $scope.selectedVersion = $scope.versions.find((version) => { return version.id === $scope.selectedVersion.id; } );
          }
          console.log("selectedVersion: ", $scope.selectedVersion);

        }
      }, true);


      $scope.render = (response) => {
        var responseJson = angular.toJson(response.value);
        if ($scope.responseJson !== responseJson) {
          $scope.responseJson = responseJson;
          $scope.versions = response.value;
          //$scope.$apply();
        }
      }


      Core.register(jolokia, $scope, {
        type: 'exec',
        mbean: managerMBean,
        operation: 'versions(java.util.List)',
        arguments: [['id', 'defaultVersion']]
      }, onSuccess($scope.render));


    };

  }

}
