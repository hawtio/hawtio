/**
 * @module UI
 */
module UI {

  export function hawtioBreadcrumbs() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: UI.templatePath + 'breadcrumbs.html',
      require: 'hawtioDropDown',
      scope: {
        config: '='
      },
      controller: ($scope, $element, $attrs) => {

        $scope.action = "itemClicked(config, $event)";

        $scope.levels = {};

        $scope.itemClicked = (config, $event) => {
          log.debug("Item clicked: ", config);

          if (config.level && angular.isNumber(config.level)) {
            $scope.levels[config.level] = config;

            var keys = Object.extended($scope.levels).keys().sortBy("");
            var toRemove = keys.from(config.level + 1);

            toRemove.forEach((i) => {
              if (i in $scope.levels) {
                $scope.levels[i] = {};
                delete $scope.levels[i];
              }
            });
            // reset any previously deleted action
            angular.forEach($scope.levels, (value, key) => {
              if (value.items && value.items.length > 0) {
                value.items.forEach((i) => {
                  log.debug("Resetting action: ", i);
                  i['action'] = $scope.action;
                });
              }
            });
            if (config.items) {
              config.open = true;
              config.items.forEach((i) => {
                i['action'] = $scope.action;
              });
              delete config.action;
            }

            // for some reason levels > 1 get two click events :-S
            if (config.level > 1) {
              $event.preventDefault();
              $event.stopPropagation();
            }
          }
        };

        function addAction(config, level) {
          config.level = level;
          if (level > 0) {
            config.breadcrumbAction = config.action;
            config.action = $scope.action;
          }
          if (config.items) {
            config.items.forEach((item) => {
              addAction(item, level + 1);
            });
          }
        }

        /*
        $scope.$watch('levels', (newValue, oldValue) => {

          if (newValue !== oldValue) {
            log.debug("levels: ", $scope.levels);
          }
        }, true);
        */

        $scope.$watch('config', (newValue, oldValue) => {
          addAction($scope.config, 0);
          $scope.levels['0'] = $scope.config;
        });
      }
    }
  }

}
