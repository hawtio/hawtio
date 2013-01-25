module Fabric {

  export function PIDViewer($scope) {
    
    var parts = $scope.fname.split('.');
    if (parts.length > 1) {
      $scope.modeName = parts[parts.length - 1];
    } else {
      $scope.modeName = "text";
    }
    
    if ($scope.modeName === 'json') {
      $scope.modeName = 'javascript';
    }

    var options = {
        readOnly: true,
        mode: {
          name: $scope.modeName
        }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);
  }

  export function PIDController($scope, $routeParams, workspace, jolokia, $window) {
    $scope.versionId = $routeParams.versionId;
    $scope.profileId = $routeParams.profileId;
    $scope.fname = $routeParams.fname;
    $scope.response = undefined;
    $scope.data = "";

    if (angular.isDefined($scope.versionId) && angular.isDefined($scope.profileId) && angular.isDefined($scope.fname)) {
      
      Core.register(jolokia, $scope, {
        type: 'exec', mbean: managerMBean,
        operation: 'getConfigurationFile(java.lang.String,java.lang.String,java.lang.String)',
        arguments: [$scope.versionId, $scope.profileId, $scope.fname]
      }, onSuccess(render));
      
    }
    
    function bytesToString(b) {
      var answer = [];
      b.forEach(function (b) {
        answer.push(String.fromCharCode(b));
      })
      return answer.join('');
    }
    
    function render(response) {
      if (!Object.equal($scope.response, response.value)) {
        $scope.response = response.value;
        $scope.data = bytesToString($scope.response);
        $scope.$apply();
      }
    }
      
  }
}