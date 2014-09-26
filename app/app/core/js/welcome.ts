/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
module Core {

  _module.controller("Core.WelcomeController", ["$scope", "$location", "branding", "localStorage", ($scope, $location, branding, localStorage) => {
    $scope.branding = branding;

    var log:Logging.Logger = Logger.get("Welcome");

    $scope.stopShowingWelcomePage = () => {
      log.debug("Stop showing welcome page");
      localStorage['showWelcomePage'] = false;

      $location.path("/");
    };

    $scope.$watch('branding.welcomePageUrl', (newValue, oldValue) => {
      // load the welcome.md file
      $.ajax({
        url: branding.welcomePageUrl,
        dataType: 'html',
        cache: false,
        success: function (data, textStatus, jqXHR) {
          $scope.html = "Unable to download welcome.md";
          if (angular.isDefined(data)) {
            $scope.html = branding.onWelcomePage(data);
          }
          Core.$apply($scope);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $scope.html = "Unable to download welcome.md";
          Core.$apply($scope);
        }
      });
    });
  }]);
}
