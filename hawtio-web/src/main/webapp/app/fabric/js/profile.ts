module Fabric {

  export function ProfileController($scope, workspace:Workspace, $routeParams) {
    var versionId = $routeParams.versionId || "1.0";
    var profileId = $routeParams.profileId || "default";
    var jolokia = workspace.jolokia;

    jolokia.request(
            {type: 'exec', mbean: managerMBean,
              operation: 'getProfiles(java.lang.String)',
              arguments: [versionId]},
            onSuccess(populateTable));


    function populateTable(response) {
      var values = response.value;
      $scope.profiles = Fabric.defaultProfileValues(workspace, versionId, values);

      // now find the row based on the selection ui
      $scope.row = $scope.profiles.find({id: profileId});
      $scope.$apply();
    }
 }
}