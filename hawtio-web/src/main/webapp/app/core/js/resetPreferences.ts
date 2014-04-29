/**
 * @module Core
 */
 module Core {
  export function ResetPreferences($scope, userDetails, jolokiaUrl, localStorage) {
    $scope.doReset = () => {

      log.info("Resetting");

      var doReset = () => {
        localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 10);
      };
      if (Core.isBlank(userDetails.username) && Core.isBlank(userDetails.password)) {
        doReset();
      } else {
        logout(jolokiaUrl, userDetails, localStorage, $scope, doReset);
      }
    };

  }
 }