module Jclouds {

    export function ProviderController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.providerId = $routeParams.providerId;

        updateTableContents();

        function setProvider(provider) {
            populateTypeForProvider(provider)
            $scope.row = provider;
            $scope.$apply();
        };


        function updateTableContents() {
            var jcloudsCoreMbean = getSelectionJcloudsMBean(workspace);
            var jolokia = workspace.jolokia;

            if (jcloudsCoreMbean) {
                setProvider(jolokia.request(
                    { type: 'exec', mbean: getSelectionJcloudsMBean(workspace), operation: 'findProviderById(java.lang.String)', arguments: [$scope.providerId]}).value
                );
            }
        }
   }
}