/**
 * @module Jclouds
 */
/// <reference path="./jcloudsPlugin.ts"/>
module Jclouds {

    _module.controller("JClouds.ApiController", ["$scope", "$filter", "workspace", "$routeParams", ($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) => {
        $scope.apiId = $routeParams.apiId;

        updateTableContents();

        function setApi(api) {
            populateTypeForApi(api)
            $scope.row = api;
            Core.$apply($scope);
        };


        function updateTableContents() {
            var jcloudsCoreMbean = getSelectionJcloudsMBean(workspace);
            var jolokia = workspace.jolokia;

            if (jcloudsCoreMbean) {
                setApi(jolokia.request(
                    { type: 'exec', mbean: getSelectionJcloudsMBean(workspace), operation: 'findApiById(java.lang.String)', arguments: [$scope.apiId]}).value
                );
            }
        }
   }]);
}
