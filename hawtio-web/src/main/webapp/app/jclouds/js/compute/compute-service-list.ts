/**
 * @module Jclouds
 */
module Jclouds {
    export function ComputeListController($scope, $location, workspace, jolokia) {

        $scope.result = {};
        $scope.computeServiceIds = [];
        $scope.computeServices = [];

        $scope.computeTable = {
            plugins: [],
            data: 'computeServices',
            showFilter: false,
            showColumnMenu: false,
            filterOptions: {
                useExternalFilter: true
            },
            selectedItems: $scope.selectedComputeServices,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'name',
                    displayName: 'Service Name',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/compute/service/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'providerId',
                    displayName: 'Proivder',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'identity',
                    displayName: 'Identity',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200,
                    resizable: false
                }
            ]
        };

        render(listJcloudsMBeanNameOfType(workspace,"compute"))

        function render(response) {
            if (!Object.equal($scope.result, response)) {
                $scope.result = response;
                $scope.computeServiceIds = $scope.result;
                var computeServices = [];
                angular.forEach($scope.computeServiceIds , (id) => {
                    computeServices.push(findContextByName(workspace, id))
                });
                $scope.computeServices = computeServices;
                Core.$apply($scope);
            }
        }
    }
}
