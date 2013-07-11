module Fabric {

  export function ContainerController($scope, workspace:Workspace, $routeParams, jolokia) {
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
      // TODO proper notifications
      stopContainer(jolokia, $scope.containerId, function () {
        console.log("Stopped!")
      }, function () {
        console.log("Failed to stop!")
      });
    };

    $scope.delete = () => {
      // TODO proper notifications
      destroyContainer(jolokia, $scope.containerId, function () {
        console.log("Deleted!")
      }, function () {
        console.log("Failed to delete!")
      });
    };

    $scope.start = () => {
      // TODO proper notifications
      startContainer(jolokia, $scope.containerId, function () {
        console.log("Started!")
      }, function () {
        console.log("Failed to start!")
      });
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
