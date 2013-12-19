/**
 * @module Core
 */
module Core {

  export function AboutController($scope, $location, branding, localStorage) {

    var log:Logging.Logger = Logger.get("About");

    // load the about.md file
    $.ajax({
      url: "app/core/doc/about.md",
      dataType: 'html',
      cache: false,
      success: function (data, textStatus, jqXHR) {
        $scope.html = "Unable to download about.md";
        if (angular.isDefined(data)) {
          $scope.html = marked(data);
          $scope.branding = branding;
          $scope.customBranding === Branding.enabled;
        }
        Core.$apply($scope);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $scope.html = "Unable to download about.md";
        Core.$apply($scope);
      }
    })
  }

}
