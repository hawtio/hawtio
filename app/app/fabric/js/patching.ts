/// <reference path="fabricPlugin.ts"/>
module Fabric {
  _module.controller("Fabric.PatchingController", ["$scope", "jolokia", "localStorage", "$location", ($scope, jolokia, localStorage, $location) => {

    $scope.files = [];
    $scope.targetVersion = $location.search()['versionId'];
    $scope.newVersionName = '';
    $scope.proxyUser = localStorage['fabric.userName'];
    $scope.proxyPassword = localStorage['fabric.password'];
    $scope.saveJmxCredentials = false;

    $scope.cancel = () => {
      $location.url('/fabric/view').search({cv: $scope.targetVersion});
    }

    $scope.valid = () => {
      return $scope.files && $scope.files.length > 0 && $scope.targetVersion !== null && $scope.proxyUser && $scope.proxyPassword;
    }

    $scope.go = () => {
      var message = $scope.files.length + ' patches';

      if ($scope.files.length === 1) {
        message = "patch: " + $scope.files[0].fileName;
      }

      Core.notification('info', "Applying " + message);

      if ($scope.saveJmxCredentials) {
        localStorage['fabric.userName'] = $scope.proxyUser;
        localStorage['fabric.password'] = $scope.proxyPassword;
      }

      var files = $scope.files.map((file) => { return file.absolutePath; });

      applyPatches(jolokia, files, $scope.targetVersion, $scope.newVersionName, $scope.proxyUser, $scope.proxyPassword,
          () => {
        Core.notification('success', "Successfully applied " + message);
        $location.url("/fabric/view");
        Core.$apply($scope);
      }, (response) => {
        log.error("Failed to apply ", message, " due to ", response.error);
        log.info("Stack trace: ", response.stacktrace);
        Core.$apply($scope);
      });
    }
  }]);
}
