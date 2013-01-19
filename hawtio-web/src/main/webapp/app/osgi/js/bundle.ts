module Osgi {

    export function BundleController($scope,$location, workspace:Workspace, $routeParams) {
        $scope.bundleId = $routeParams.bundleId;

        updateTableContents();

        function populateTable(response) {
            var values = response.value;
            $scope.bundles = values;
            // now find the row based on the selection ui
            Osgi.defaultBundleValues(workspace, $scope, values);
            $scope.row = Osgi.findBundle($scope.bundleId, values);
            $scope.$apply();
        };

        function updateTableContents() {
            //console.log("Loading the bundles");
            var mbean = getSelectionBundleMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                        {type: 'exec', mbean: mbean, operation: 'listBundles()'},
                        onSuccess(populateTable));
            }
        }

        $scope.startBundle = (bundleId) => {
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'startBundle', arguments: [bundleId]}
            ],
                    onSuccess(updateTableContents));
        };

        $scope.stopBundle = (bundleId) => {
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'stopBundle', arguments: [bundleId]}
            ],
                    onSuccess(updateTableContents));
        };

        $scope.updatehBundle = (bundleId) =>{
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'updateBundle', arguments: [bundleId]}
            ],
                    onSuccess(updateTableContents));
        };

        $scope.refreshBundle = (bundleId) => {
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'refreshBundle', arguments: [bundleId]}
            ],
                    onSuccess(updateTableContents));
        };

        $scope.uninstallBundle = (bundleId) => {
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'uninstallBundle', arguments: [bundleId]}
            ],
                    onSuccess($location.path("/osgi/bundles")));
        };
    }
}