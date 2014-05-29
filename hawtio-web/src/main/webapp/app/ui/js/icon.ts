/**
 * @module UI
 */
module UI {

  /**
   * Test controller for the icon help page
   * @param $scope
   * @param $templateCache
   * @constructor
   */
  export function IconTestController($scope, $templateCache) {
    $scope.exampleHtml = $templateCache.get('example-html');
    $scope.exampleConfigJson = $templateCache.get('example-config-json');

    $scope.$watch('exampleConfigJson', (newValue, oldValue) => {
      $scope.icons = angular.fromJson($scope.exampleConfigJson);
      //log.debug("Icons: ", $scope.icons);
    });
  }

  /**
   * The hawtio-icon directive
   * @returns {{}}
   */
  export function hawtioIcon() {
    log.debug("Creating icon directive");
    return {
      restrict: 'E',
      replace: true,
      templateUrl: UI.templatePath + 'icon.html',
      scope: {
        icon: '=config'
      },
      link: ($scope, $element, $attrs) => {
        if (!$scope.icon) {
          return;
        }
        if (!('type' in $scope.icon) && !Core.isBlank($scope.icon.src)) {
          if ($scope.icon.src.startsWith("icon-")) {
            $scope.icon.type = "icon";
          } else {
            $scope.icon.type = "img";
          }
        }
        //log.debug("Created icon: ", $scope.icon);
      }
    };
  }

}
