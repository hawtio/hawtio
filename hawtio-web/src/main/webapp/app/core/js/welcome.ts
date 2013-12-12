/**
 * @module Core
 */
module Core {

  export function WelcomeController($scope, $location, branding, localStorage) {

    var log:Logging.Logger = Logger.get("Welcome");

    $scope.stopShowingWelcomePage = () => {
      log.debug("Stop showing welcome page");
      localStorage['showWelcomePage'] = false;

      $location.path("/");
    };

    // load the welcome.md file
    $.ajax({
      url: "app/core/doc/welcome.md",
      dataType: 'html',
      cache: false,
      success: function (data, textStatus, jqXHR) {
        $scope.html = "Unable to download welcome.md";
        if (angular.isDefined(data)) {
          $scope.html = marked(data);
          $scope.branding = branding;
        }
        Core.$apply($scope);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $scope.html = "Unable to download welcome.md";
        Core.$apply($scope);
      }
    })
  }

}
