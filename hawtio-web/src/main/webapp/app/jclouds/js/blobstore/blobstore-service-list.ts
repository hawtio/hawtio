/**
 * @module Jclouds
 */
module Jclouds {
    export function BlobstoreListController($scope, $location, workspace, jolokia) {

        $scope.result = {};
        $scope.blobstoreServiceIds = [];
        $scope.blobstoreServices = [];

        $scope.blobstoreTable = {
            plugins: [],
            data: 'blobstoreServices',
            showFilter: false,
            showColumnMenu: false,
            filterOptions: {
                useExternalFilter: true
            },
            selectedItems: $scope.selectedBlobstoreServices,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'name',
                    displayName: 'Service Name',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/blobstore/service/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
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

        render(listJcloudsMBeanNameOfType(workspace, "blobstore"))

        function render(response) {
            if (!Object.equal($scope.result, response)) {
                $scope.result = response;
                $scope.blobstoreServiceIds = $scope.result;
                var blobstoreServices = [];
                angular.forEach($scope.blobstoreServiceIds , (id) => {
                    blobstoreServices.push(findContextByName(workspace, id))
                });
                $scope.blobstoreServices = blobstoreServices;
                Core.$apply($scope);
            }
        }
    }
}
