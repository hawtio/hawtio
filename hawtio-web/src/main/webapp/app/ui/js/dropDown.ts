/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  export function hawtioDropDown($templateCache) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: UI.templatePath + 'dropDown.html',
      scope: {
        config: '=hawtioDropDown'
      },
      controller: ["$scope", "$element", "$attrs", ($scope, $element, $attrs) => {

        if (!$scope.config) {
          $scope.config = {};
        }

        if (!('open' in $scope.config)) {
          $scope.config['open'] = false;
        }

        $scope.action = (config, $event) => {
          //log.debug("doAction on : ", config, "event: ", $event);
          if ('items' in config && !('action' in config)) {
            config.open = !config.open;
            $event.preventDefault();
            $event.stopPropagation();
          } else if ('action' in config) {
            //log.debug("executing action: ", config.action);
            var action = config['action'];
            if (angular.isFunction(action)) {
              action.apply();
            } else if (angular.isString(action)) {
              $scope.$parent.$eval(action, {
                config: config,
                '$event': $event
              });
            }
          }
        };

        $scope.$watch('config.items', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            // just add some space to force a redraw
            $scope.menuStyle = $scope.menuStyle + " ";
          }
        }, true);

        $scope.submenu = (config) => {
          if (config && config.submenu) {
            return "sub-menu";
          }
          return "";
        };

        $scope.icon = (config) => {
          if (config && !Core.isBlank(config.icon)) {
            return config.icon
          } else {
            return 'icon-spacer';
          }
        };

        $scope.open = (config) => {
          if (config && !config.open) {
            return '';
          }
          return 'open';
        };

      }],
      link: ($scope, $element, $attrs) => {
        $scope.menuStyle = $templateCache.get("withsubmenus.html");

        if ('processSubmenus' in $attrs) {
          if (!Core.parseBooleanValue($attrs['processSubmenus'])) {
            $scope.menuStyle = $templateCache.get("withoutsubmenus.html");
          }
        }

      }
    };
  }

  _module.directive('hawtioDropDown', ["$templateCache", UI.hawtioDropDown]);

}
