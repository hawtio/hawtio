/**
 * @module Jclouds
 */
/// <reference path="../jcloudsPlugin.ts"/>
module Jclouds {
    _module.controller("Jclouds.BlobstoreContainerListController", ["$scope", "$location", "workspace", "jolokia", "$routeParams", ($scope, $location, workspace, jolokia, $routeParams) => {
        $scope.blobstoreId = $routeParams.blobstoreId;

        $scope.result = {};
        $scope.containers = [];

        // selected containers
        $scope.selectedContainers = [];


        $scope.containerTable = {
            plugins: [],
            data: 'containers',
            showFilter: false,
            showColumnMenu: false,
            filterOptions: {
                useExternalFilter: true
            },
            selectedItems: $scope.selectedContainers,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'name',
                    displayName: 'Name',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/blobstore/container/{{blobstoreId}}/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'creationDate',
                    displayName: 'Created',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200,
                    resizable: false
                }
            ]
        };

        Core.register(jolokia, $scope, {
            type: 'exec', mbean: getSelectionJcloudsBlobstoreMBean(workspace, $scope.blobstoreId), operation: 'list()'
        }, onSuccess(render));


        function render(response) {
            if (!Object.equal($scope.result, response.value)) {
                $scope.result = response.value;
                $scope.containers = $scope.result
                Core.$apply($scope);
            }
        }
    }]);
}
