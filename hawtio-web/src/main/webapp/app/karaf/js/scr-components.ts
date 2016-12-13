/**
 * @module Karaf
 */
/// <reference path="./karafPlugin.ts"/>
module Karaf {

    export var ScrComponentsController = _module.controller("Karaf.ScrComponentsController", ["$scope", "$location", "$timeout", "workspace", "jolokia", ($scope, $location, $timeout, workspace, jolokia) => {

        $scope.component = empty();

        // caches last jolokia result
        $scope.result = [];

        // rows in components table
        $scope.components = [];

        // selected components
        $scope.selectedComponents = [];

        $scope.showActivateEventFeedback = false;
        $scope.showDeactivateEventFeedback = false;
        $scope.defaultTimeout = 3000;

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
                    width: 600
                },
                {
                    field: 'State',
                    displayName: 'State',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200
                }
            ]
        };

        var scrMBean = Karaf.getSelectionFabricScrMBean(workspace);
        if (scrMBean) {
            Core.register(jolokia, $scope, {
                type: 'exec', mbean: scrMBean,
                operation: 'listComponents()'
            }, onSuccess((response) => {
                var components = response.value || [];
                render(createFabricScrComponentsView(response.value))
            }));
        } else {
            scrMBean = Karaf.getSelectionScrMBean(workspace);
            if (scrMBean) {
                render(getAllComponents(workspace, jolokia))
                // no auto-refreshing in Karaf version of SCR MBean
            }
        }

        $scope.canActivateAllSelected = () => {
            var result = $scope.selectedComponents.length > 0 && $scope.selectedComponents.all((c) => {
                    return c.State !== "Active"
                });

            return result;
        }

        $scope.canDeactivateAllSelected = () => {
            var result = $scope.selectedComponents.length > 0 && $scope.selectedComponents.all((c) => {
                    return c.State === "Active"
                });

            return result;
        }

        $scope.activate = () => {
            $scope.showActivateEventFeedback = true;
            $timeout(function () { $scope.showActivateEventFeedback = false; }, $scope.defaultTimeout);
            $scope.selectedComponents.forEach(function (component) {
                activateComponent(workspace, jolokia, component.Name, function () {
                    console.log("Activated!")
                }, function () {
                    console.log("Failed to activate!")
                });
            });
            $scope.selectedComponents.splice(0, $scope.selectedComponents.length);
        };

        $scope.deactivate = () => {
            $scope.showDeactivateEventFeedback = true;
            $timeout(function () { $scope.showDeactivateEventFeedback = false; }, $scope.defaultTimeout);
            $scope.selectedComponents.forEach(function (component) {
                deactivateComponent(workspace, jolokia, component.Name, function () {
                    console.log("Deactivated!")
                }, function () {
                    console.log("Failed to deactivate!")
                });
            });
            $scope.selectedComponents.splice(0, $scope.selectedComponents.length);
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
    }]);
}
