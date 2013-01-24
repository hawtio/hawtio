module Osgi {

    export function PidController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.pid = $routeParams.pid;

        updateTableContents();

        function populateTable(response) {
            $scope.row = response.value
            $scope.$apply();
        };

        function updateTableContents() {
            var mbean = getSelectionConfigAdminMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                    {type: 'exec', mbean: mbean, operation: 'getProperties', arguments: [$scope.pid]},
                    onSuccess(populateTable));
            }
        }
    }
}
