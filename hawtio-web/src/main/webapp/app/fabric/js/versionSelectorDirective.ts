module Fabric {

  export function VersionSelector($templateCache) {

    return {
      restrict: 'A',
      replace: true,
      templateUrl: Fabric.templatePath + "versionSelector.html",
      scope: {
        selectedVersion: '=fabricVersionSelector',
        availableVersions:'=?',
        menuBind: '=?',
        exclude: '@'
      },
      controller: ($scope, $element, $attrs, jolokia) => {
        $scope.versions = [];
        $scope.responseJson = '';

        $scope.$watch('selectedVersion', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            if (newValue && 'id' in newValue) {
              $scope.selectedVersion = $scope.versions.find((version) => {
                return version.id === newValue['id'];
              });
            } else {
              $scope.selectedVersion = $scope.versions.find((version) => {
                return version.defaultVersion;
              });
            }
          }
        });

        $scope.$watch('versions', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            if ($scope.selectedVersion && 'id' in $scope.selectedVersion) {
              $scope.selectedVersion = $scope.versions.find((version) => {
                return version.id === $scope.selectedVersion['id'];
              });
            } else {
              $scope.selectedVersion = $scope.versions.find((version) => {
                return version.defaultVersion;
              });
            }
          }
        }, true);

        function excludeVersions(versions, exclude) {
          if (angular.isString(exclude)) {
            if (exclude.has("[") && exclude.has("]")) {
              exclude = angular.fromJson(exclude);
            } else {
              exclude = [exclude];
            }
          }
          //log.debug("exclude: ", exclude);
          if (!exclude || exclude.length === 0) {
            return versions;
          }
          return versions.exclude((v) => {
            return exclude.some((e) => { return e === v.id });
          });
        }

        function generateMenu(versions) {
          return $scope.versions.map((v) => {
            return {
              title: v.id,
              action: () => {
                $scope.selectedVersion = v;
                if (!Core.isBlank($scope.onPick)) {
                  $scope.$parent.$eval($scope.onPick, {
                    version: v['id']
                  });
                }
              }
            }
          });
        }

        $scope.$watch('exclude', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            // need to rebuild the original version list
            if ($scope.responseJson) {
              var versions  = angular.fromJson($scope.responseJson);
              buildArray(versions);
            }
          }
        });

        function buildArray(versions) {
          //log.debug("Building array from: ", versions);
          $scope.versions = Fabric.sortVersions(versions, $scope.desc);
          $scope.versions = excludeVersions($scope.versions, $scope.exclude);
          if ($scope.config) {
            $scope.config.items = generateMenu($scope.versions);
          }
          $scope.availableVersions = $scope.versions;
        }

        $scope.render = (response) => {
          var responseJson = angular.toJson(response.value);
          if ($scope.responseJson !== responseJson) {
            $scope.responseJson = responseJson;
            buildArray(response.value);
            Core.$apply($scope);
          }
        };

        Core.register(jolokia, $scope, {
          type: 'exec',
          mbean: managerMBean,
          operation: 'versions(java.util.List)',
          arguments: [
            ['id', 'defaultVersion']
          ]
        }, onSuccess($scope.render));
      },

      link: ($scope, $element, $attrs) => {
        $scope.template = $templateCache.get('withSelect');
        if (Core.parseBooleanValue($attrs['useMenu'])) {
          $scope.config = {
            title: 'Version'
          };
          if (!Core.isBlank($attrs['menuTitle'])) {
            $scope.config.title = $attrs['menuTitle'];
          }
          if (!Core.isBlank($attrs['menuBind'])) {
            $scope.$watch('menuBind', (newValue, oldValue) => {
              if (!Core.isBlank(newValue)) {
                $scope.config.title = newValue;
              }
            });
          }
          if (!Core.isBlank($attrs['onPick'])) {
            $scope.onPick = $attrs['onPick'];
          }
          if (!Core.isBlank($attrs['useIcon'])) {
            $scope.config.icon = $attrs['useIcon'];
          }
          $scope.desc = 'desc' in $attrs;
          $scope.template = $templateCache.get('withMenu');
        }
      }

    };

  }
}
