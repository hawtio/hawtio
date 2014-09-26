/**
 * @module Jclouds
 */
/// <reference path="../jcloudsPlugin.ts"/>
module Jclouds {

    _module.controller("Jclouds.ComputeLocationController", ["$scope", "$filter", "workspace", "$routeParams", ($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) => {
        $scope.computeId = $routeParams.computeId
        $scope.locationId = $routeParams.locationId;

        updateTableContents();

        function setLocationProfiles(locationProfiles) {
            $scope.row = findLocationById(locationProfiles, $scope.locationId)
            Core.$apply($scope);
        };


        function updateTableContents() {
            var jolokia = workspace.jolokia;
            var computeMbean = getSelectionJcloudsComputeMBean(workspace, $scope.computeId);

            if (computeMbean) {
                setLocationProfiles(jolokia.request(
                    {type: 'exec', mbean:computeMbean, operation: 'listAssignableLocations()'}).value
                );
            }
        }

        function findLocationById(locationProfiles, id) {
            return locationProfiles.find(function (location) {
                return location.id === id
            });
        }
   }]);
}
