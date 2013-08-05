module Karaf {

    export function ScrController($scope, $location, workspace, jolokia) {

        $scope.component = empty();

        // caches last jolokia result
        $scope.result = [];

        // rows in components table
        $scope.components = [];

        // selected components
        $scope.selectedComponents = [];


        $scope.scrOptions = {
            //plugins: [searchProvider],
            data: 'components',
            showFilter: false,
            showColumnMenu: false,
            filterOptions: {
                useExternalFilter: true
            },
            selectedItems: $scope.selectedComponents,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'Name',
                    displayName: 'Name',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 400
                },
                {
                    field: 'State',
                    displayName: 'State',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200
                }
            ]
        };

        var scrMBean = Karaf.getSelectionScrMBean(workspace);
        if (scrMBean) {
            Core.register(jolokia, $scope, {
                type: 'exec', mbean: scrMBean, operation: 'listComponents()'
            }, onSuccess(render));
        }

        $scope.activate = () => {
            $scope.selectedComponents.forEach(function (component) {
                activateComponent(workspace, jolokia, component.Name, function () {
                    console.log("Activated!")
                }, function () {
                    console.log("Failed to activate!")
                });
            });
        };

        $scope.deactivate = () => {
            $scope.selectedComponents.forEach(function (component) {
                deactivateComponent(workspace, jolokia, component.Name, function () {
                    console.log("Deactivated!")
                }, function () {
                    console.log("Failed to deactivate!")
                });
            });
        };


        function empty() {
            return [
                {Name: "",
                 Status: false}
            ];
        }

        function render(response) {
            if (!Object.equal($scope.result, response.value)) {
                $scope.components = Karaf.createScrComponentsView(workspace, jolokia, response.value);
                $scope.result = $scope.components;
                Core.$apply($scope);
            }
        }
    }
}
