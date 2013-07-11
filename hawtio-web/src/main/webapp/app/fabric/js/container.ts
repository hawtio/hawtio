module Fabric {

  export function ContainerController($scope, workspace:Workspace, $routeParams, jolokia, $location) {
    $scope.containerId = $routeParams.containerId;

    $scope.selectedProfiles = [];
    $scope.selectedProfilesDialog = [];
    $scope.selectedProfilesString = '';


    $scope.$watch('selectedProfiles', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.selectedProfilesString = '';
        $scope.selectedProfiles.each((p) => {
          $scope.selectedProfilesString += '<li>' + p.id + '</li>\n';
        });
      }
    }, true);

    $scope.connect = () => {
      // TODO lets find these from somewhere! :)
      var userName = "admin";
      var password = "admin";
      Fabric.connect($scope.row, userName, password, true);
    };

    $scope.stop = () => {
      doStopContainer($scope, jolokia, $scope.containerId);
    };

    $scope.delete = () => {
      // avoid any nasty errors that the container doesn't existing anymore
      Core.unregister(jolokia, $scope);
      doDeleteContainer($scope, jolokia, $scope.containerId, () => {
        $location.path('/fabric/view');
      });
    };

    $scope.start = () => {
      doStartContainer($scope, jolokia, $scope.containerId);
    };

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
    };


    $scope.updateContainerProperty = (propertyName, row) => {
      setContainerProperty(jolokia, row.id, propertyName, row[propertyName], () => { $
        $scope.$apply(); 
      }, (response) => {
        notification('error', 'Failed to set container property due to : ' + response.error);
        $scope.$apply(); 
      });
    }


    $scope.getClass = (item) => {
      if (!$scope.provisionListFilter) {
        return 'no-filter';
      } else if (item.has($scope.provisionListFilter)) {
        return 'match-filter';
      } else {
        return 'no-match-filter';
      }
    }


    $scope.addProfiles = () => {
      $scope.addProfileDialog = false;
      var addedProfiles = $scope.selectedProfilesDialog.map((p) => { return p.id });
      var text = Core.maybePlural(addedProfiles.length, "profile");
      addProfilesToContainer(jolokia, $scope.row.id, addedProfiles, () => {
        notification('success', "Successfully added " + text);
        $scope.selectedProfilesDialog = [];
        Core.$apply($scope);
      }, (response) => {
        notification('error', "Failed to add " + text + " due to " + response.error);
        $scope.selectedProfilesDialog = [];
        Core.$apply($scope);
      });
    };


    $scope.deleteProfiles = () => {
      var removedProfiles = $scope.selectedProfiles.map((p) => { return p.id });
      var text = Core.maybePlural(removedProfiles.length, "profile");
      removeProfilesFromContainer(jolokia, $scope.row.id, removedProfiles, () => {
        notification('success', "Successfully removed " + text);
        $scope.selectedProfiles = [];
        Core.$apply($scope);
      }, (response) => {
        notification('error', "Failed to remove " + text + " due to " + response.error);
        $scope.selectedProfiles = [];
        Core.$apply($scope);
      });
    };


    if (angular.isDefined($scope.containerId)) {
      Core.register(jolokia, $scope, {
        type: 'exec', mbean: managerMBean,
        operation: 'getContainer(java.lang.String)',
        arguments: [$scope.containerId]
      }, onSuccess(render));
    }


    function render(response) {
      if (!Object.equal($scope.row, response.value)) {
        $scope.row = response.value;
        if ($scope.row) {
          $scope.services = getServiceList($scope.row);
        }
      }
    }

  }
}
