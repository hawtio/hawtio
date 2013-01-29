module Karaf {

    export function FeatureController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.name = $routeParams.name;
        $scope.version = $routeParams.version;

        updateTableContents();

        function populateTable(response) {
            angular.forEach(response.value["Features"], (feature) => {
                    angular.forEach(feature, (entry) => {

                        if (entry["Name"] === $scope.name && entry["Version"] === $scope.version) {
                            //$scope.row = entry;
                            $scope.row = extractFeature(response.value, entry["Name"], entry["Version"])
                        }
                    });
            });
            $scope.$apply();
        };

        function updateTableContents() {
            var mbean = getSelectionFeaturesMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                    {type: 'read', mbean: getSelectionFeaturesMBean(workspace)},
                    onSuccess(populateTable));
            }
        }
    }
}