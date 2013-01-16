module Osgi {

    export function BundleController($scope, workspace:Workspace, $routeParams) {
        var bundleId = $routeParams.bundleId;
        var jolokia = workspace.jolokia;

        jolokia.request(
                {type: 'exec', mbean: bundleStateMBean,
                    operation: 'listBundles()'},
                onSuccess(populateTable));


        function populateTable(response) {
            var values = response.value;
            $scope.bundles = values;
            // now find the row based on the selection ui
            Osgi.defaultBundleValues(workspace, $scope, values);
            $scope.row = Osgi.findBundle(bundleId, values);
            $scope.$apply();
        }
    }
}