/// <reference path="fabricPlugin.ts"/>
module Fabric {

  _module.controller("Fabric.PIDController", ["$scope", "$routeParams", "jolokia", "$location", ($scope, $routeParams, jolokia, $location) => {
    $scope.versionId = $routeParams.versionId;
    $scope.profileId = $routeParams.profileId;
    $scope.fname = $routeParams.fname;
    $scope.response = undefined;
    $scope.data = "";
    $scope.dirty = false;

    $scope.getMode = () => {
      var parts = $scope.fname.split('.');
      var mode = parts[parts.length - 1];
      if (!mode) {
        return 'text';
      }
      switch(mode) {
        case 'cfg':
          mode = "properties";
          break;
      }
      return mode;
    }

    $scope.mode = $scope.getMode();

    if (angular.isDefined($scope.versionId) && angular.isDefined($scope.profileId) && angular.isDefined($scope.fname)) {
      
      Core.register(jolokia, $scope, {
        type: 'exec', mbean: managerMBean,
        operation: 'getConfigurationFile(java.lang.String,java.lang.String,java.lang.String)',
        arguments: [$scope.versionId, $scope.profileId, $scope.fname]
      }, onSuccess(render));
      
    }

    $scope.save = () => {
      saveConfigFile(jolokia, $scope.versionId, $scope.profileId, $scope.fname, $scope.data.encodeBase64(), () => {
        $scope.dirty = false;
        notification('success', "Saved " + $scope.fname);
        $location.path("/fabric/profile/" + $scope.versionId + "/" + $scope.profileId);
      }, (response) => {
        notification('error', "Failed to save " + $scope.fname + " due to " + response.error);
      });
    };

    function stringToBytes(s) {
      return s.codes();
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
        $scope.data = $scope.response.decodeBase64();
        $scope.mode = $scope.getMode();
        Core.$apply($scope);
      }
    }
  }]);
}
