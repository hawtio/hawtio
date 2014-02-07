module Fabric {

  export function VersionSelector($templateCache) {

    return {
      restrict: 'A',
      replace: true,
      templateUrl: Fabric.templatePath + "versionSelector.html",
      scope: {
        selectedVersion: '=fabricVersionSelector',
        menuBind: '=',
        order: '&'
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


        $scope.render = (response) => {
          var responseJson = angular.toJson(response.value);
          if ($scope.responseJson !== responseJson) {
            $scope.responseJson = responseJson;
            $scope.versions = Fabric.sortVersions(response.value, $scope.desc);
            if ($scope.config) {
              $scope.config.items = $scope.versions.map((v) => {
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
          if ('desc' in $attrs) {
            $scope.desc = true;
          } else {
            $scope.desc = false;
          }
          $scope.template = $templateCache.get('withMenu');
        }
      }

    };

  }
}
