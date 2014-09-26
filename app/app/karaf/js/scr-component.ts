/**
 * @module Karaf
 */
/// <reference path="./karafPlugin.ts"/>
module Karaf {

    _module.controller("Karaf.ScrComponentController", ["$scope", "$location", "workspace", "jolokia", "$routeParams", ($scope, $location, workspace, jolokia, $routeParams) => {

        $scope.name = $routeParams.name;
        populateTable();

        function populateTable() {
            $scope.row = getComponentByName(workspace, jolokia, $scope.name);
            Core.$apply($scope);
        }

        $scope.activate = () => {
            activateComponent(workspace, jolokia, $scope.row['Name'], function () {
                console.log("Activated!")
            }, function () {
                console.log("Failed to activate!")
            });
        };

        $scope.deactivate = () => {
            deactivateComponent(workspace, jolokia, $scope.row['Name'], function () {
                console.log("Deactivated!")
            }, function () {
                console.log("Failed to deactivate!")
            });
        };
    }]);
}
