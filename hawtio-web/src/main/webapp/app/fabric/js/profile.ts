module Fabric {

  export function ProfileController($scope, workspace:Workspace, $routeParams, jolokia) {
    var versionId = $routeParams.versionId || "1.0";
    var profileId = $routeParams.profileId || "default";

    $scope.configurationCount = () => {
      var answer = 0;
      if ($scope.row) {
        answer = Object.keys($scope.row.configurations).length;
      }
      return answer;
    }

    $scope.configurationKeys = () => {
      var answer = []
      if ($scope.row) {
        answer = Object.keys($scope.row.configurations);
      }
      return answer;
    }

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
