module Fabric {

  export function ContainerController($scope, workspace:Workspace, $routeParams, jolokia) {
    $scope.containerId = $routeParams.containerId;

    if (angular.isDefined($scope.containerId)) {
      Core.register(jolokia, $scope, {
          type: 'exec', mbean: managerMBean,
          operation: 'getContainer(java.lang.String)',
          arguments: [$scope.containerId]
      }, onSuccess(render));
    }

    $scope.connect = () => {
      // TODO lets find these from somewhere! :)
      var userName = "admin";
      var password = "admin";
      Fabric.connect($scope.row, userName, password, true);
    };

    $scope.stop = () => {
      // TODO proper notifications
      stopContainer(jolokia, $scope.containerId, function() {console.log("Stopped!")}, function() {console.log("Failed to stop!")});
    };

    $scope.delete = () => {
      // TODO proper notifications
      destroyContainer(jolokia, $scope.containerId, function() {console.log("Deleted!")}, function() {console.log("Failed to delete!")});
    };

    $scope.start = () => {
      // TODO proper notifications
      startContainer(jolokia, $scope.containerId, function() {console.log("Started!")}, function() {console.log("Failed to start!")});
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
      showSelectionCheckbox: true,
      multiSelect: true,
      selectWithCheckboxOnly: true,
      keepLastSelected: false,
      columnDefs: [
        {
          field: 'id',
          displayName: 'Profiles',
          cellTemplate: '<div class="ngCellText"><a href="#/fabric/profile/{{versionId}}/{{row.entity.id}}{{hash}}">{{row.entity.id}}</a></div>'
        }]
    };

    $scope.addProfiles = () => {

    };

    $scope.deleteProfiles = () => {
      var containerIds = [ $scope.containerId ];
      var profileIds = $scope.row.profileIds;
      // remove the selected ones
      angular.forEach($scope.profilesGridOptions.selectedItems, (object) => {
        profileIds = profileIds.remove(object.id);
      });
      var versionId = $scope.versionId;
      console.log("Remaining profile ids: " + profileIds + " container " + containerIds + " version + " + versionId);

      var text = Core.maybePlural($scope.profilesGridOptions.selectedItems.length, "profile");
      applyProfiles(jolokia, versionId, profileIds, containerIds, () => {
        notification('success', "Successfully removed " + text);
      }, (response) => {
        notification('error', "Failed to remove " + text + " due to " + response.error);
      });
    };

    function render(response) {
      if (!Object.equal($scope.row, response.value)) {
        $scope.row = response.value;
        if ($scope.row) {
          var versionId = $scope.row.versionId;
          $scope.versionId = versionId;
          var profileIds = $scope.row.profileIds;
          console.log("==== loaded profile Ids: " + profileIds);
          $scope.profileIdArray = profileIds ? profileIds.map((value) => { return {id: value, versionId: versionId}; }) : [];
          $scope.services = getServiceList($scope.row);
        }
        $scope.$apply();
      }
    }
 }
}
