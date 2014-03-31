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
          //log.debug("Item clicked: ", config);

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
                  //log.debug("Resetting action: ", i);
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
            } else {
              //ooh we picked a thing!
              var keys = Object.extended($scope.levels).keys().sortBy("");
              var path = [];
              keys.forEach((key) => {
                path.push($scope.levels[key]['title']);
              });
              var pathString = '/' + path.join("/");
              $scope.config.path = pathString
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

        function setLevels(config, pathParts, level) {
          if (pathParts.length === 0) {
            return;
          }
          var part = pathParts.removeAt(0)[0];
          //log.debug("config: ", config, " checking part: ", part, " pathParts: ", pathParts);

          if (config && config.items) {
            var matched = false;
            config.items.forEach((item) => {
              //log.debug("checking item: ", item, " against part: ", part);
              if (!matched && item['title'] === part) {
                //log.debug("Found match");
                matched = true;
                $scope.levels[level] = item;
                setLevels(item, pathParts, level + 1);
              }
            });
          }
        }

        // watch to see if the parent scope changes the path
        $scope.$watch('config.path', (newValue, oldValue) => {
          if (!Core.isBlank(newValue)) {
            var pathParts = newValue.split('/').exclude((p) => { return Core.isBlank(p); });
            //log.debug("path: ", newValue);
            //log.debug("pathParts: ", pathParts);
            var matches = true;
            pathParts.forEach((part, index) => {
              //log.debug("Checking part: ", part, " index: ", index)
              if (!matches) {
                return;
              }
              if (!$scope.levels[index] || Core.isBlank($scope.levels[index]['title']) || $scope.levels[index]['title'] !== part) {
                matches = false;
              }
            });
            //log.debug("matches: ", matches);
            if (matches) {
              return;
            }

            // adjust $scope.levels to match the path
            $scope.levels = [];
            $scope.levels['0'] = $scope.config;
            setLevels($scope.config, pathParts.from(0), 1);
          }
        });

        $scope.$watch('config', (newValue, oldValue) => {
          addAction($scope.config, 0);
          $scope.levels['0'] = $scope.config;
        });
      }
    }
  }

}
