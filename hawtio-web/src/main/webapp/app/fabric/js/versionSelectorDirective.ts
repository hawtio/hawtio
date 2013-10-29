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

      $scope.$watch('selectedVersion', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if (newValue && 'id' in newValue) {
            $scope.selectedVersion = $scope.versions.find((version) => { return version.id === newValue['id']; } );
          } else {
            $scope.selectedVersion = $scope.versions.find((version) => { return version.defaultVersion; });
          }
        }
      });

      $scope.$watch('versions', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if ($scope.selectedVersion && 'id' in $scope.selectedVersion) {
            $scope.selectedVersion = $scope.versions.find((version) => { return version.id === $scope.selectedVersion['id']; } );
          } else {
            $scope.selectedVersion = $scope.versions.find((version) => { return version.defaultVersion; });
          }
        }
      }, true);


      $scope.render = (response) => {
        var responseJson = angular.toJson(response.value);
        if ($scope.responseJson !== responseJson) {
          $scope.responseJson = responseJson;
          $scope.versions = response.value;
          Core.$apply($scope);
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
