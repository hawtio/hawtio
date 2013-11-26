/**
 * @module Osgi
 */
module Osgi {
  export function BundleListController($scope, workspace:Workspace, jolokia) {
    $scope.result = {};
    $scope.bundles = [];
    $scope.bundleUrl = "";
    $scope.display = {
      bundleField: "Name",
      sortField: "Identifier",
      bundleFilter: "",
      startLevelFilter: 0
    };

    $scope.installDisabled = function () {
      return $scope.bundleUrl === "";
    }

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
                notification("success", "Fragment installed succesfully.");
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
                    notification("success", "Bundle installed and started successfully.");
                    $scope.bundleUrl = "";
                    Core.$apply($scope);
                  },
                  error: function (response) {
                    notification("error", response.error)
                  }
                });
              }
            },
            error: function (response) {
              notification("error", response.error)
            }
          });
        },
        error: function (response) {
          notification("error", response.error);
        }
      });
    };

    /*
     $scope.$watch("display.sortField", function() {
     $scope.bundles = $scope.bundles.sortBy(function(n){
     switch ($scope.display.sortField) {
     case "Name":
     return n.Name;
     case "SymbolicName":
     return n.SymbolicName;
     default:
     return n.Identifier;
     }
     });
     render();
     });
     $scope.$watch("display.bundleField", function() {
     render();
     });
     $scope.$watch("display.bundleFilter", function() {
     render();
     });
     $scope.$watch("display.startLevelFilter", function() {
     render();
     });
     */

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
      if ($scope.display.bundleFilter && !labelText.toLowerCase().has($scope.display.bundleFilter.toLowerCase())) {
        return false;
      }
      return true;
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
          }));

        }, 500);
      }
    }

    Core.register(jolokia, $scope, {
      type: 'exec', mbean: getSelectionBundleMBean(workspace),
      operation: 'listBundles()'
    }, onSuccess(processResponse));
  }
}
