module Apollo {
  export function VirtualHostController($scope, $http, $location, localStorage, workspace:Workspace) {
    $scope.virtual_host = {}
    $scope.init = (virtual_host_name)=>{
      $scope.ajax("GET", "/broker/virtual-hosts/"+virtual_host_name, (host)=>{
        $scope.virtual_host = host
      });
    };
  }
}