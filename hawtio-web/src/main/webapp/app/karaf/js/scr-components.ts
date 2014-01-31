/**
 * @module Karaf
 */
module Karaf {

    export function ScrComponentsController($scope, $location, workspace, jolokia) {

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
                useExternalFilter: false
            },
            sortInfo: { fields: ['Name'], directions: ['asc'] },
            selectedItems: $scope.selectedComponents,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'Name',
                    displayName: 'Name',
                    cellTemplate: '<div class="ngCellText"><a href="#/osgi/scr-component/{{row.entity.Name}}?p=container">{{row.getProperty(col.field)}}</a></div>',
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
            render(getAllComponents(workspace, jolokia))
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

        function render(components) {
            if (!Object.equal($scope.result, components)) {
                $scope.components = components
                $scope.result = $scope.components;
                Core.$apply($scope);
            }
        }
    }
}
