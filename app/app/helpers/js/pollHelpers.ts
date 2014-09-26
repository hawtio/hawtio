/// <reference path="../../baseHelpers.ts"/>
module PollHelpers {

  var log:Logging.Logger = Logger.get("PollHelpers");
  
  export function setupPolling($scope, updateFunction:(next:() => void) => void, period = 5000) {
    var $timeout:ng.ITimeoutService = Core.injector.get('$timeout');
    var jolokia:Jolokia.IJolokia = Core.injector.get('jolokia');

    var promise:ng.IPromise<any> = undefined;

    var refreshFunction = () => {
      log.debug("Polling");
      updateFunction(() => {
        if (jolokia.isRunning()) {
          promise = $timeout(refreshFunction, period);
        }
      });
    };

    $scope.$on('$routeChangeStart', () => {
      $timeout.cancel(promise);
    });
    return refreshFunction;

  }

}
