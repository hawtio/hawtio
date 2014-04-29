/**
 * @module JVM
 */

 module JVM {
  export function ResetController($scope, localStorage) {
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

  }
 }