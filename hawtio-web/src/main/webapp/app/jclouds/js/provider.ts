/**
 * @module Jclouds
 */
module Jclouds {

  /**
   * Controller to show the details of a Jclouds provider
   *
   * @method ProviderController
   * @for Jclouds
   * @param {ng.IScope} $scope
   * @param {ng.IFilterService} $filter
   * @param {Workspace} workspace
   * @param {ng.IRouteParamsService} $routeParams
   */
    export function ProviderController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.providerId = $routeParams.providerId;

        updateTableContents();

        function setProvider(provider) {
            populateTypeForProvider(provider)
            $scope.row = provider;
            Core.$apply($scope);
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
