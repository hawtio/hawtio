/**
 * @module Jclouds
 */
module Jclouds {
    export function HardwareListController($scope, $location, workspace, jolokia, $routeParams) {
        $scope.computeId = $routeParams.computeId;

        $scope.result = {};
        $scope.hardwares = [];

        // selected hardwares
        $scope.selectedHardwares = [];


        $scope.hardwareTable = {
            plugins: [],
            data: 'hardwares',
            showFilter: false,
            showColumnMenu: false,
            filterOptions: {
                useExternalFilter: true
            },
            selectedItems: $scope.selectedHardwares,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'Id',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/compute/hardware/{{computeId}}/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'name',
                    displayName: 'Name',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'ram',
                    displayName: 'Ram',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'hypervisor',
                    displayName: 'Hypervisor',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200,
                    resizable: false
                }
            ]
        };

        Core.register(jolokia, $scope, {
            type: 'exec', mbean: getSelectionJcloudsComputeMBean(workspace, $scope.computeId), operation: 'listHardwareProfiles()'
        }, onSuccess(render));


        function render(response) {
            if (!Object.equal($scope.result, response.value)) {
                $scope.result = response.value;
                $scope.hardwares = $scope.result
                Core.$apply($scope);
            }
        }


        $scope.is64BitIcon = (is64bit) => {
            if (is64bit) {
                return 'icon-thumbs-up';
            } else {
                return 'icon-thumbs-down';
            }
        }
    }
}
