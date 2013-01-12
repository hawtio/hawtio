module Fabric {

  export function ContainerController($scope, workspace:Workspace, $routeParams) {
    var containerId = $routeParams.containerId || "root";
    var jolokia = workspace.jolokia;

    jolokia.request(
            {type: 'exec', mbean: managerMBean,
              operation: 'getContainer(java.lang.String)',
              arguments: [containerId]},
            onSuccess(populateTable));


    function populateTable(response) {
      $scope.row = response.value;
      Fabric.defaultContainerValues(workspace, [$scope.row]);
      $scope.$apply();
    }
 }
}