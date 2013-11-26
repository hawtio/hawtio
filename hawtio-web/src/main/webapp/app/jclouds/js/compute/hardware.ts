/**
 * @module Jclouds
 */
module Jclouds {

    export function HardwareController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.computeId = $routeParams.computeId
        $scope.hardwareId = $routeParams.hardwareId;

        updateTableContents();

        $scope.processorsTable = {
            plugins: [],
            data: 'processors',
            showFilter: false,
            displayFooter: false,
            displaySelectionCheckbox: false,
            showColumnMenu: false,
            rowHeight: 32,
            columnDefs: [
                {
                    field: 'cores',
                    displayName: 'Cores',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 50,
                    resizable: false
                },
                {
                    field: 'speed',
                    displayName: 'Speed',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 100,
                    resizable: false
                }
            ]
        };

        $scope.volumesTable = {
            plugins: [],
            data: 'volumes',
            showFilter: false,
            displayFooter: false,
            displaySelectionCheckbox: false,
            showColumnMenu: false,
            rowHeight: 32,
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'Id',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 100,
                    resizable: false
                },
                {
                    field: 'type',
                    displayName: 'Type',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 100,
                    resizable: false
                },
                {
                    field: 'device',
                    displayName: 'Device',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 100,
                    resizable: false
                },
                {
                    field: 'size',
                    displayName: 'Size',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 100,
                    resizable: false
                },
                {
                    field: 'bootDevice',
                    displayName: 'Boot Device',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 100,
                    resizable: false
                },
                {
                    field: 'durable',
                    displayName: 'Durable',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 100,
                    resizable: false
                }
            ]
        };

        function setHardwareProfiles(hardwareProfiles) {
            $scope.row = findHardwareById(hardwareProfiles, $scope.hardwareId)
            $scope.processors = $scope.row["processors"];
            $scope.volumes = $scope.row["volumes"];
            Core.$apply($scope);
        };


        function updateTableContents() {
            var jolokia = workspace.jolokia;
            var computeMbean = getSelectionJcloudsComputeMBean(workspace, $scope.computeId);

            if (computeMbean) {
                setHardwareProfiles(jolokia.request(
                    {type: 'exec', mbean:computeMbean, operation: 'listHardwareProfiles()'}).value
                );
            }
        }

        function findHardwareById(hardwareProfiles, id) {
            return hardwareProfiles.find(function (hardware) {
                return hardware.id === id
            });
        }
   }
}
