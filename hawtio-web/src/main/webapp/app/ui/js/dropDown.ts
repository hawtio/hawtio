/**
 * @module UI
 */
module UI {

  export function hawtioDropDown($templateCache) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: UI.templatePath + 'dropDown.html',
      scope: {
        config: '=hawtioDropDown'
      },
      controller: ($scope, $element, $attrs) => {

        if (!('open' in $scope.config)) {
          $scope.config['open'] = false;
        }

        $scope.action = (config, $event) => {
          log.debug("doAction on : ", config, "event: ", $event);
          if ('items' in config) {
            config.open = !config.open;
            $event.preventDefault();
            $event.stopPropagation();
          } else {
            if ('action' in config) {
              var action = config['action'];
              if (angular.isFunction(action)) {
                action.apply();
              } else if (angular.isString(action)) {
                $scope.$parent.$eval(action);
              }
            }
          }
        };

        $scope.submenu = (config) => {
          if (config.submenu) {
            return "sub-menu";
          }
          return "";
        };

        $scope.icon = (item) => {
          if (!Core.isBlank(item.icon)) {
            return item.icon
          } else {
            return 'icon-spacer';
          }
        };

        $scope.open = (config) => {
          if (!config.open) {
            return '';
          }
          return 'open';
        };

      },
      link: ($scope, $element, $attrs) => {

      }
    };
  }

}
