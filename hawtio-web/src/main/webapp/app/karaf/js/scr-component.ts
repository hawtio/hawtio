/**
 * @module Karaf
 */
/// <reference path="./karafPlugin.ts"/>
module Karaf {

    _module.controller("Karaf.ScrComponentController", ["$scope", "$location", "$timeout", "workspace", "jolokia", "$routeParams", ($scope, $location, $timeout, workspace, jolokia, $routeParams) => {

        $scope.showActivateEventFeedback = false;
        $scope.showDeactivateEventFeedback = false;
        $scope.defaultTimeout = 3000;

        $scope.name = $routeParams.name;
        populateTable();

        function populateTable() {
            $scope.row = getComponentByName(workspace, jolokia, $scope.name);
            Core.$apply($scope);
        }

        $scope.canActivate = () => {
            var result = $scope.row.State !== "Active";
            return result;
        }

        $scope.activate = () => {
            $scope.showActivateEventFeedback = true;
            $timeout(function () { $scope.showActivateEventFeedback = false; }, $scope.defaultTimeout);
            activateComponent(workspace, jolokia, $scope.row['Name'], function () {
                console.log("Activated!")
                populateTable();
            }, function () {
                console.log("Failed to activate!")
                populateTable();
            });
        };

        $scope.deactivate = () => {
            $scope.showDeactivateEventFeedback = true;
            $timeout(function () { $scope.showDeactivateEventFeedback = false; }, $scope.defaultTimeout);
            deactivateComponent(workspace, jolokia, $scope.row['Name'], function () {
                console.log("Deactivated!")
                populateTable();
            }, function () {
                console.log("Failed to deactivate!")
                populateTable();
            });
        };
    }]);
}
