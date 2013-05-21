module Fabric {

  export function ContainerController($scope, workspace:Workspace, $routeParams, jolokia) {
    $scope.containerId = $routeParams.containerId;
    $scope.profileQuery = [null, ["id"]];
    $scope.profiles = [];
    $scope.addProfileArray = [];

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

    $scope.profilesGridOptions = {
      data: 'profileIdArray',
      selectedItems: [],
      afterSelectionChange: () => {
        $scope.profileIdHtml = "";
        angular.forEach($scope.profilesGridOptions.selectedItems, (object) => {
          $scope.profileIdHtml += "<li>" + object.id + "</li>";
        });
      },
      showSelectionCheckbox: true,
      multiSelect: true,
      selectWithCheckboxOnly: true,
      keepLastSelected: false,
      columnDefs: [
        {
          field: 'id',
          displayName: 'Profiles',
          cellTemplate: '<div class="ngCellText"><a href="#/fabric/profile/{{versionId}}/{{row.entity.id}}{{hash}}">{{row.entity.id}}</a></div>'
        }
      ]
    };

    $scope.addProfileGridOptions = {
      data: 'addProfileArray',
      selectedItems: [],
      showSelectionCheckbox: true,
      multiSelect: true,
      selectWithCheckboxOnly: false,
      keepLastSelected: false,
      columnDefs: [
        {
          field: 'id',
          displayName: 'Name'
        }
      ]
    };

    $scope.addProfiles = () => {
      console.log("Adding profiles: " + $scope.addProfileGridOptions.selectedItems);

      var containerIds = [ $scope.containerId ];
      var profileIds = $scope.row.profileIds;
      // remove the selected ones
      angular.forEach($scope.addProfileGridOptions.selectedItems, (object) => {
        profileIds.push(object.id);
      });
      profileIds = profileIds.unique();
      var versionId = $scope.versionId;
      //console.log("Remaining profile ids: " + profileIds + " container " + containerIds + " version + " + versionId);

      var text = Core.maybePlural($scope.addProfileGridOptions.selectedItems.length, "profile");
      applyProfiles(jolokia, versionId, profileIds, containerIds, () => {
        notification('success', "Successfully added " + text);
      }, (response) => {
        notification('error', "Failed to add " + text + " due to " + response.error);
      });
    };

    $scope.deleteProfiles = () => {
      var containerIds = [ $scope.containerId ];
      var profileIds = $scope.row.profileIds;
      // remove the selected ones
      angular.forEach($scope.profilesGridOptions.selectedItems, (object) => {
        profileIds = profileIds.remove(object.id);
      });
      var versionId = $scope.versionId;
      //console.log("Remaining profile ids: " + profileIds + " container " + containerIds + " version + " + versionId);

      var text = Core.maybePlural($scope.profilesGridOptions.selectedItems.length, "profile");
      applyProfiles(jolokia, versionId, profileIds, containerIds, () => {
        notification('success', "Successfully removed " + text);
      }, (response) => {
        notification('error', "Failed to remove " + text + " due to " + response.error);
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
          var versionId = $scope.row.versionId;
          if (versionId) {
            $scope.versionId = versionId;
            $scope.profileQuery[0] = versionId;
            if (!$scope.registeredProfiles) {
              $scope.registeredProfiles = true;
              Core.register(jolokia, $scope, {
                type: 'exec', mbean: managerMBean, operation: 'getProfiles(java.lang.String, java.util.List)', arguments: $scope.profileQuery
              }, onSuccess(onProfiles));
            }
          }
          var profileIds = $scope.row.profileIds;
          $scope.profileIdArray = profileIds ? profileIds.map((value) => {
            return {id: value, versionId: versionId};
          }) : [];
          $scope.services = getServiceList($scope.row);
          updateAddProfiles();
        }
      }
    }

    function onProfiles(response) {
      if (response.value) {
        $scope.profiles = response.value;
      }
      updateAddProfiles();
    }

    /**
     * Lets filter out all the profiles that are not currently in use
     */
    function updateAddProfiles() {
      var newData = $scope.profiles.filter(object => !$scope.profileIdArray.find({id: object.id}));
      $scope.addProfileArray = newData;
/*
      $scope.addProfileArray.splice(0, $scope.addProfileArray.length, newData);
*/
      Core.$apply($scope);
    }
  }
}
