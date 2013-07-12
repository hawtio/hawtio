module Karaf {

    export function FeatureController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.name = $routeParams.name;
        $scope.version = $routeParams.version;
        $scope.bundlesByLocation = {};

        updateTableContents();

        function populateTable(response) {
            angular.forEach(response.value["Features"], (feature) => {
                angular.forEach(feature, (entry) => {

                    if (entry["Name"] === $scope.name && entry["Version"] === $scope.version) {
                        //$scope.row = entry;
                        $scope.row = extractFeature(response.value, entry["Name"], entry["Version"])
                        addBundleDetails($scope.row);
                    }
                });
            });
            Core.$apply($scope);
        };

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
    }
}