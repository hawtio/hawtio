/**
 * @module JVM
 */
/// <reference path="./jvmPlugin.ts"/>
 module JVM {
  _module.controller("JVM.ResetController", ["$scope", "localStorage", ($scope, localStorage) => {
    $scope.doClearConnectSettings = () => {
      var doReset = () => {
        delete localStorage[JVM.connectControllerKey];
        delete localStorage[JVM.connectionSettingsKey];
        setTimeout(() => {
          window.location.reload();
        }, 10);
      };
      doReset();
    };

  }]);
 }
