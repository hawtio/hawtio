/**
 * @module Jclouds
 */
/// <reference path="../jcloudsPlugin.ts"/>
module Jclouds {

    _module.controller("Jclouds.BlobstoreLocationController", ["$scope", "$filter", "workspace", "$routeParams", ($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) => {
        $scope.blobstoreId = $routeParams.blobstoreId
        $scope.locationId = $routeParams.locationId;

        updateTableContents();

        function setLocationProfiles(locationProfiles) {
            $scope.row = findLocationById(locationProfiles, $scope.locationId)
            Core.$apply($scope);
        };


        function updateTableContents() {
            var jolokia = workspace.jolokia;
            var blobstoreMbean = getSelectionJcloudsBlobstoreMBean(workspace, $scope.blobstoreId);

            if (blobstoreMbean) {
                setLocationProfiles(jolokia.request(
                    {type: 'exec', mbean:blobstoreMbean, operation: 'listAssignableLocations()'}).value
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
