/**
 * @module Diagnostics
 */
/// <reference path="./diagnosticsPlugin.ts"/>
module Diagnostics {

  _module.controller("Diagnostics.HeapController", ["$scope", "$window", "$location", "localStorage", "workspace", "jolokia", "mbeanName", ($scope, $window, $location, localStorage:WindowLocalStorage, workspace, jolokia, mbeanName) => {

    Diagnostics.configureScope($scope, $location, workspace);
    $scope.classHistogram = '';
    $scope.status = '';


    $scope.loadClassStats = () => {
      jolokia.request({
        type: 'exec', 
        mbean: 'com.sun.management:type=DiagnosticCommand',
        operation: 'gcClassHistogram([Ljava.lang.String;)',
        arguments: ['']
      }, {
        success: render,
        error: (response) => {
          $scope.status = 'Could not get class histogram : ' + response.error;
          Core.$apply($scope);
        }
      });
    };


    function render(response) {
      $scope.classHistogram = response.value;
      Core.$apply($scope);
    }

  }]);

}
