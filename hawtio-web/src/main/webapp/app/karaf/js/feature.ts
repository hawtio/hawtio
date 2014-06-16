/**
 * @module Karaf
 */
/// <reference path="./karafPlugin.ts"/>
module Karaf {

    _module.controller("Karaf.FeatureController", ["$scope", "jolokia", "workspace", "$routeParams", ($scope, jolokia, workspace:Workspace, $routeParams) => {
        $scope.hasFabric = Fabric.hasFabric(workspace);
        $scope.name = $routeParams.name;
        $scope.version = $routeParams.version;
        $scope.bundlesByLocation = {};
        $scope.props = "properties";

        updateTableContents();

        $scope.install = () => {
          installFeature(workspace, jolokia, $scope.name, $scope.version, function () {
            notification('success', 'Installed feature ' + $scope.name);
          }, function (response) {
            notification('error', 'Failed to install feature ' + $scope.name + ' due to ' + response.error);
          });
        }

        $scope.uninstall = () => {
          uninstallFeature(workspace, jolokia, $scope.name, $scope.version, function () {
            notification('success', 'Uninstalled feature ' + $scope.name);
          }, function (response) {
            notification('error', 'Failed to uninstall feature ' + $scope.name + ' due to ' + response.error);
          });
        }

        $scope.toProperties = (elements) => {
          var answer = '';
          angular.forEach(elements, (value, name) => {
            answer += value['Key'] + " = " + value['Value'] + "\n";
          });
          return answer.trim();
        }


        function populateTable(response) {
          $scope.row = extractFeature(response.value, $scope.name, $scope.version);
          if ($scope.row) {
            addBundleDetails($scope.row);
            var dependencies = [];
            //TODO - if the version isn't set or is 0.0.0 then maybe we show the highest available?
            angular.forEach($scope.row.Dependencies, (version, name) => {
              angular.forEach(version, (data, version) => {
                dependencies.push({
                  Name: name,
                  Version: version
                });
              });
            });
            $scope.row.Dependencies = dependencies;
          }
          //console.log("row: ", $scope.row);
          Core.$apply($scope);

        }

        function setBundles(response) {
            var bundleMap = {};
            Osgi.defaultBundleValues(workspace, $scope, response.values);
            angular.forEach(response.value, (bundle) => {
                var location = bundle["Location"];
                $scope.bundlesByLocation[location] = bundle;
            });
        };


        function updateTableContents() {
            var featureMbean = getSelectionFeaturesMBean(workspace);
            var bundleMbean = Osgi.getSelectionBundleMBean(workspace);
            var jolokia = workspace.jolokia;

            if (bundleMbean) {
                setBundles(jolokia.request(
                    {type: 'exec', mbean: bundleMbean, operation: 'listBundles()'}));
            }

            if (featureMbean) {
                jolokia.request(
                    {type: 'read', mbean: featureMbean},
                    onSuccess(populateTable));
            }
        }

        function addBundleDetails(feature) {
            var bundleDetails = [];
            angular.forEach(feature["Bundles"], (bundleLocation)=> {
                var bundle = $scope.bundlesByLocation[bundleLocation];
                if (bundle) {
                    bundle["Installed"] = true;
                    bundleDetails.push(bundle);
                } else {
                    bundleDetails.push({
                        "Location": bundleLocation,
                        "Installed": false
                    })

                }
            });
            feature["BundleDetails"] = bundleDetails;
        }
    }]);
}
