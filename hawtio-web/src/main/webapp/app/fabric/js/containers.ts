module Fabric {

  export function ContainerRow($scope, workspace:Workspace, jolokia) {

  Core.register(jolokia, $scope, {
      type: 'exec', mbean: managerMBean,
      operation: 'getContainer(java.lang.String)',
      arguments: [$scope.row.id]
    }, onSuccess(render));
    
    function render(response) {
      if (!Object.equal($scope.row, response.value)) {
        $scope.row = response.value
        $scope.$apply();
      }
    }
  }


  export function ContainersController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia) {
    $scope.profileId = '';
    
    $scope.foo = (row) => {
      if (!angular.isDefined($scope.profileId) || $scope.profileId === '') {
        return true;
      }
      if (row.profileIds.find($scope.profileId)) {
        return true;
      }
      return false;      
    }

    $scope.profileIds = () => {
      // TODO this should be a generic function?
      var answer = [""];
      angular.forEach($scope.profileMap, (value, key) => answer.push(key));
      return answer;
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets update the profileId from the URL if its available
      var key = $location.search()['p'];
      if (key && key !== $scope.profileId) {
        $scope.profileId = key;
      }
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      function populateTable(response) {
        var values = response.value;
        $scope.containers = defaultContainerValues(workspace, $scope, values);
        $scope.$apply();
      }

      jolokia.request(
              {type: 'exec', mbean: managerMBean, operation: 'containers'},
              onSuccess(populateTable));
    });
  }
}
