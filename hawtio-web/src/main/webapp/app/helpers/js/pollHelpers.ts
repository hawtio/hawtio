/// <reference path="../../baseHelpers.ts"/>
module PollHelpers {

  var log:Logging.Logger = Logger.get("PollHelpers");
  
  export function setupPolling($scope, updateFunction:(next:() => void) => void, period = 2000) {
    if ($scope.$hasPoller) {
      log.debug("scope already has polling set up, ignoring subsequent polling request");
      return;
    }
    $scope.$hasPoller = true;
    var $timeout:ng.ITimeoutService = Core.injector.get('$timeout');
    var jolokia:Jolokia.IJolokia = Core.injector.get('jolokia');
    var promise:ng.IPromise<any> = undefined;
    var name = $scope.name || 'anonymous scope';

    var refreshFunction = () => {
      log.debug("polling for scope: ", name);
      updateFunction(() => {
        if (jolokia.isRunning() && $scope.$hasPoller) {
          promise = $timeout(refreshFunction, period);
        }
      });
    };

    $scope.$on('$destroy', () => {
      log.debug("scope", name, " being destroyed, cancelling polling");
      delete $scope.$hasPoller;
      $timeout.cancel(promise); 
    });

    $scope.$on('$routeChangeStart', () => {
      log.debug("route changing, cancelling polling for scope: ", name);
      delete $scope.$hasPoller;
      $timeout.cancel(promise);
    });
    return refreshFunction;

  }

}
