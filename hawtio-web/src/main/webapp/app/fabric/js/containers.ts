module Fabric {

  export function ContainerRow($scope, workspace:Workspace, jolokia) {

    $scope.statusIcon = () => {
      if ($scope.row) {
        if ($scope.row.alive) {
          switch($scope.row.provisionResult) {
            case 'success': 
              return "icon-thumbs-up";
            case 'downloading':
              return "icon-download-alt";
            case 'installing':
              return "icon-hdd";
            case 'analyzing':
            case 'finalizing':
              return "icon-refresh icon-spin";
            case 'resolving':
              return "icon-sitemap";
            case 'error':
              return "red icon-warning-sign";
          }
        } else {
          return "icon-off";
        }
      }
      return "icon-refresh icon-spin";
    }

    if (angular.isDefined($scope.containerId)) {
      Core.register(jolokia, $scope, {
        type: 'exec', mbean: managerMBean,
        operation: 'getContainer(java.lang.String)',
        arguments: [$scope.containerId]
      }, onSuccess(render, {
        error: function(response) => {
          // most likely the container has been deleted
          $scope.$destroy();
          $scope.$apply();
        }
      }));
    }
    
    function render(response) {
      if (!Object.equal($scope.row, response.value)) { 
        $scope.row = response.value
        $scope.$parent.setProfilesFor($scope.row);
        $scope.$apply();
      }
    }
    
  }


  export function ContainersController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia) {
    $scope.profileId = '';
    
    $scope.profileMap = {};

    $scope.profileIds = () => {
      var answer = [""];
      angular.forEach($scope.profileMap, (value, key) => {
        answer = answer.union(value)
      });
      return answer;
    }
    
    $scope.setProfilesFor = function (row) {
      $scope.profileMap[row.id] = row.profileIds;
    }

    $scope.show = (row) => {
      if (!angular.isDefined($scope.profileId) || $scope.profileId === '') {
        return true;
      }

      if (angular.isDefined($scope.profileMap[row].find( function (id) { return $scope.profileId === id })) ) {
        return true;
      }

      return false;      
    }

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets update the profileId from the URL if its available
      var key = $location.search()['p'];
      if (key && key !== $scope.profileId) {
        $scope.profileId = key;
      }
    });

    Core.register(jolokia, $scope, {
      type: 'exec', mbean: managerMBean,
      operation: 'containerIds()',
      arguments: []
    }, onSuccess(render));
    
    function render(response) {
      if (!Object.equal($scope.containers, response.value)) {
        $scope.containers = response.value;
        $scope.$apply();
      }
    }
    
  }
}
