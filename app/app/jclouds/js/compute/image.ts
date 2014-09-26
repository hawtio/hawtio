/**
 * @module Jclouds
 */
/// <reference path="../jcloudsPlugin.ts"/>
module Jclouds {

    _module.controller("Jclouds.ImageController", ["$scope", "$filter", "workspace", "$routeParams", ($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) => {
        $scope.computeId = $routeParams.computeId
        $scope.imageId = $routeParams.imageId;

        updateTableContents();

        function setImage(api) {
            $scope.row = api;
            Core.$apply($scope);
        };


        function updateTableContents() {
            var jolokia = workspace.jolokia;
            var computeMbean = getSelectionJcloudsComputeMBean(workspace, $scope.computeId);

            if (computeMbean) {
                setImage(jolokia.request(
                    { type: 'exec', mbean: computeMbean , operation: 'getImage(java.lang.String)', arguments: [$scope.imageId]}).value
                );
            }
        }
   }]);
}
