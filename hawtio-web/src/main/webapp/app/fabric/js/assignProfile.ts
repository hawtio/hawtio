module Fabric {

  export function AssignProfileController($scope, jolokia, $location, $routeParams, workspace) {

    $scope.profileId = $routeParams['pid'];
    $scope.versionId = $routeParams['vid'];

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.containerIdFilter = '';

    var valid = true;

    if (Core.isBlank($scope.profileId)) {
      log.warn("No profile ID specified, redirecting to Fabric management view");
      valid = false;
    }

    if (Core.isBlank($scope.versionId)) {
      log.warn("No version ID specified, redirecting to Fabric management view");
      valid = false;
    }

    if (!valid) {
      $location.path("/fabric/view");
    }

    $scope.gotoCreate = () => {
      $location.path('/fabric/containers/createContainer').search({
        versionId: $scope.versionId,
        profileIds: $scope.profileId
      });
    };

    $scope.$on('$routeChangeSuccess', () => {
      log.debug("RouteParams: ", $routeParams);
      log.debug("Scope: ", $scope);

    });

    $scope.$watch('containers', (newValue, oldValue) => {
      if (newValue !== oldValue && newValue) {
        $scope.selected = newValue.filter((c) => { return c['selected']});
      }
    }, true);

    $scope.assignProfiles = () => {
      var requests = [];
      $scope.selected.forEach((c) => {
        requests.push({
          type: 'exec', mbean: Fabric.managerMBean,
          operation: 'addProfilesToContainer',
          arguments: [c.id, [$scope.profileId]]
        });
      });
      notification('info', "Applying " + $scope.profileId + " to the selected containers");
      var outstanding = requests.length;
      jolokia.request(requests, onSuccess(() => {
        outstanding = outstanding - 1;
        if (outstanding === 0) {
          notification('success', "Applied " + $scope.profileId);
          Core.$apply($scope);
        }
      }));
      setTimeout(() => {
        $location.path("/fabric/activeProfiles");
        Core.$apply($scope);
      }, 30);
    }

  }

}
