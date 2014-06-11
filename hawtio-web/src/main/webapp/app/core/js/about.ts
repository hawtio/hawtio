/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
module Core {

  _module.controller("Core.AboutController", ["$scope", "$location", "jolokia", "branding", "localStorage", ($scope, $location, jolokia, branding, localStorage) => {

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
          $scope.customBranding = branding.enabled;
          try {
            $scope.hawtioVersion = jolokia.request({
              type: "read",
              mbean: "hawtio:type=About",
              attribute: "HawtioVersion"
            }).value;
          } catch (Error) {
            // ignore
            $scope.hawtioVersion = "N/A";
          }
          $scope.jolokiaVersion = jolokia.version().agent;
          $scope.serverProduct = jolokia.version().info.product;
          $scope.serverVendor = jolokia.version().info.vendor;
          $scope.serverVersion = jolokia.version().info.version;
        }
        Core.$apply($scope);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $scope.html = "Unable to download about.md";
        Core.$apply($scope);
      }
    })
  }]);

}
