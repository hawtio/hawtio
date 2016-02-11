/**
 * @module Osgi
 */
/// <reference path="./osgiPlugin.ts"/>
module Osgi {
  _module.controller("Osgi.BundleListController", ["$scope", "workspace", "jolokia", "localStorage", ($scope, workspace:Workspace, jolokia, localStorage) => {
    $scope.result = {};
    $scope.bundles = [];
    $scope.bundleUrl = "";
    $scope.display = {
      bundleField: "Name",
      sortField: "Identifier",
      bundleFilter: "",
      startLevelFilter: 0,
      showActiveMQBundles: false,
      showCamelBundles: false,
      showCxfBundles: false,
      showPlatformBundles: false,
      showAllBundles: false
    };

    if ('bundleList' in localStorage) {
      $scope.display = angular.fromJson(localStorage['bundleList']);
    }

    $scope.$watch('display', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        localStorage['bundleList'] = angular.toJson(newValue);
      }
    }, true);

    $scope.installDisabled = function () {
      return $scope.bundleUrl === "";
    };

    $scope.install = function () {
      jolokia.request({
        type: 'exec',
        mbean: getSelectionFrameworkMBean(workspace),
        operation: "installBundle(java.lang.String)",
        arguments: [$scope.bundleUrl]
      }, {
        success: function (response) {
          var bundleID = response.value;
          jolokia.request({
            type: 'exec',
            mbean: getSelectionBundleMBean(workspace),
            operation: "isFragment(long)",
            arguments: [bundleID]
          }, {
            success: function (response) {
              var isFragment = response.value;
              if (isFragment) {
                Core.notification("success", "Fragment installed successfully.");
                $scope.bundleUrl = "";
                Core.$apply($scope);
              } else {
                jolokia.request({
                  type: 'exec',
                  mbean: getSelectionFrameworkMBean(workspace),
                  operation: "startBundle(long)",
                  arguments: [bundleID]
                }, {
                  success: function (response) {
                    Core.notification("success", "Bundle installed and started successfully.");
                    $scope.bundleUrl = "";
                    Core.$apply($scope);
                  },
                  error: function (response) {
                    Core.notification("error", response.error)
                  }
                });
              }
            },
            error: function (response) {
              Core.notification("error", response.error)
            }
          });
        },
        error: function (response) {
          Core.notification("error", response.error);
        }
      });
    };

    $scope.$watch('display.sortField', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.bundles = $scope.bundles.sortBy(newValue);
      }
    });

    $scope.getStateStyle = (state) => {
      return Osgi.getStateStyle("badge", state);
    };

    $scope.getLabel = (bundleObject) => {
      var labelText;
      if ($scope.display.bundleField === "Name") {
        labelText = bundleObject.Name;
        if (labelText === "") {
          labelText = bundleObject.SymbolicName;
        }
      } else {
        labelText = bundleObject.SymbolicName;
      }
      return labelText;
    };

    $scope.filterBundle = (bundle) => {
      if ($scope.display.startLevelFilter > 0 && bundle.StartLevel < $scope.display.startLevelFilter) {
        return false;
      }
      var labelText = $scope.getLabel(bundle);
      if ($scope.display.bundleFilter) {
        if (!labelText.toLowerCase().has($scope.display.bundleFilter.toLowerCase())) {
          return false;
        } else {
          if ($scope.display.showActiveMQBundles || $scope.display.showPlatformBundles
              || $scope.display.showCxfBundles || $scope.display.showCamelBundles) {
            if ((matchesCheckedBundle(bundle)) ) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        }
      } else {
        if (matchesCheckedBundle(bundle)){
          return true;
        } else {
          return false;
        }
      }

      return true;
    };

    function matchesCheckedBundle(bundle) {
      if (($scope.display.showPlatformBundles && Karaf.isPlatformBundle(bundle['SymbolicName'])) ||
          ($scope.display.showActiveMQBundles && Karaf.isActiveMQBundle(bundle['SymbolicName'])) ||
          ($scope.display.showCxfBundles && Karaf.isCxfBundle(bundle['SymbolicName'])) ||
          ($scope.display.showCamelBundles && Karaf.isCamelBundle(bundle['SymbolicName'])) || 
          $scope.display.showAllBundles) {
        return true;
      } else {
        return false;
      }
    };

    function processResponse(response) {

      var value = response['value'];

      var responseJson = angular.toJson(value);

      if ($scope.responseJson !== responseJson) {
        $scope.responseJson = responseJson;
        $scope.bundles = [];
        angular.forEach(value, function (value, key) {
          var obj = {
            Identifier: value.Identifier,
            Name: "",
            SymbolicName: value.SymbolicName,
            Fragment: value.Fragment,
            State: value.State,
            Version: value.Version,
            LastModified: new Date(Number(value.LastModified)),
            Location: value.Location,
            StartLevel: undefined
          };
          if (value.Headers['Bundle-Name']) {
            obj.Name = value.Headers['Bundle-Name']['Value'];
          }
          $scope.bundles.push(obj);
        });

        $scope.bundles = $scope.bundles.sortBy($scope.display.sortField);

        Core.$apply($scope);

        // Obtain start level information for all the bundles, let's do this async though
        setTimeout(() => {

          var requests = [];

          for (var i = 0; i < $scope.bundles.length; i++) {
            var b = $scope.bundles[i];
            requests.push({
              type: 'exec', mbean: getSelectionBundleMBean(workspace),
              operation: 'getStartLevel(long)',
              arguments: [b.Identifier]
            });
          }

          var outstanding = requests.length;

          jolokia.request(requests, onSuccess((response) => {
            var id = response['request']['arguments'].first();
            if (angular.isDefined(id)) {
              var bundle = $scope.bundles[id];
              if (bundle) {
                log.debug("Setting bundle: ", bundle['Identifier'], " start level to: ", response['value']);
                bundle['StartLevel'] = response['value'];
              }
            }
            outstanding = outstanding - 1;
            log.debug("oustanding responses: ", outstanding);
            if (outstanding === 0) {
              log.debug("Updating page...");
              Core.$apply($scope);
            }
          }, { error: (response) => {
            // let's ignore the error - maybe the bundle is no longer available?
          } }));

        }, 500);
      }
    }

    Core.register(jolokia, $scope, {
      type: 'exec', mbean: getSelectionBundleMBean(workspace),
      operation: 'listBundles()'
    }, onSuccess(processResponse));
  }]);
}
