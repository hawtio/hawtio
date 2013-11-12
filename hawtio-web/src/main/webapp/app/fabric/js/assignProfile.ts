module Fabric {

  export function AssignProfileController($scope, jolokia, $location, $routeParams) {

    $scope.profileId = $routeParams['pid'];
    $scope.versionId = $routeParams['vid'];

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

    $scope.$on('$routeChangeSuccess', () => {
      log.debug("RouteParams: ", $routeParams);
      log.debug("Scope: ", $scope);
    });

    $scope.$watch('selectedContainerIds', (newValue, oldValue) => {
      log.debug("selected containers: ", newValue);
    }, true);

  }

}
