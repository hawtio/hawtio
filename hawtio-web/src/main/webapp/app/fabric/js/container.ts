module Fabric {

  export function ContainerController($scope, workspace:Workspace, $routeParams, jolokia) {
    var containerId = $routeParams.containerId || "root";

    $scope.getType = () => {
      if ($scope.row) {
        if ($scope.row.ensembleServer) {
          return "Fabric Server";
        } else if ($scope.row.managed) {
          return "Managed Container";
        } else {
          return "Unmanaged Container";
        }
      }
      return "";
    }

    jolokia.request(
            {type: 'exec', mbean: managerMBean,
              operation: 'getContainer(java.lang.String)',
              arguments: [containerId]},
            onSuccess(populateTable));


    function populateTable(response) {
      $scope.row = response.value;
      Fabric.defaultContainerValues(workspace, $scope, [$scope.row]);
      $scope.$apply();
    }
 }
}
