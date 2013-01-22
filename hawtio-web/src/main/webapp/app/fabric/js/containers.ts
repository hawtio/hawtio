module Fabric {

  export function ContainerRow($scope, workspace:Workspace, jolokia) {
    
    $scope.selected = false;
    $scope.row = {};
    
    $scope.isMe = (ids) => {
      if (ids.find( function(s) { return s === $scope.containerId; })) {
        return true;
      }
      return false;      
    }
    
    $scope.$on('stop-container', function(event, args) {
      if ($scope.isMe(args.selected)) {
        $scope.stop();
      }
    });

    $scope.$on('start-container', function(event, args) {
      if ($scope.isMe(args.selected)) {
        $scope.start();
      }
    });

    $scope.$on('delete-container', function(event, args) {
      if ($scope.isMe(args.selected)) {
        $scope.delete();
      }
    });

    $scope.$watch('selected', function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      $scope.$emit('container-selected', {id: $scope.containerId, selected: $scope.selected});
    });

    $scope.$watch('$parent.all', function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      $scope.selected = newValue;
    });

    $scope.stop = () => {
      jolokia.request(
          {
            type: 'exec', mbean: managerMBean,
            operation: 'stopContainer(java.lang.String)',
            arguments: [$scope.containerId]
          },
          onSuccess(function() {
            // TODO show a notification
            console.log("Stopped!");
          }));
    }

    $scope.delete = () => {
      jolokia.request(
          {
            type: 'exec', mbean: managerMBean,
            operation: 'destroyContainer(java.lang.String)',
            arguments: [$scope.containerId]
          },
          onSuccess(function() {
            // TODO show a notification
            console.log("Deleted!");
          }));
    }

    $scope.start = () => {
      jolokia.request(
          {
            type: 'exec', mbean: managerMBean,
            operation: 'startContainer(java.lang.String)',
            arguments: [$scope.containerId]
          },
          onSuccess(function() {
            // TODO show a notification
            console.log("Started!");
          }));
    }

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
        $scope.$emit('container-updated', {id: $scope.row.id, profiles: $scope.row.profileIds});
        $scope.$apply();
      }
    }    
  }


  export function ContainersController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia, $document) {
    $scope.profileId = '';
    $scope.all = false;
    $scope.selected = {};
    
    $scope.profileMap = {};

    $scope.profileIds = () => {
      var answer = [""];
      angular.forEach($scope.profileMap, (value, key) => {
        answer = answer.union(value)
      });
      return answer;
    }

    $scope.$on('container-updated', function(event, args) {
      $scope.profileMap[args.id] = args.profiles;      
    });
    
    $scope.getSelected = function() {
      var answer = [];
      angular.forEach($scope.selected, function(value, key) {
        if (value) {
          answer.push(key);
        }
      });
      return answer;
    }
    
    $scope.start = () => {
      var selected = $scope.getSelected();
      $scope.$broadcast('start-container', { selected: selected });
    }

    $scope.delete = () => {
      var selected = $scope.getSelected();
      $scope.$broadcast('delete-container', { selected: selected });
    }

    $scope.stop = () => {
      var selected = $scope.getSelected();
      $scope.$broadcast('stop-container', { selected: selected });
    }

    $scope.$on('container-selected', function (event, args) {
      $scope.selected[args.id] = args.selected;
      var anySelected = false;
      angular.forEach($scope.selected, function(value, key) {
        if (value) {
          anySelected = true;
        }
      });
      $scope.anySelected = anySelected;
    });

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
