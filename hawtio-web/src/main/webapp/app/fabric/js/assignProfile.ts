/// <reference path="fabricPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
module Fabric {
  _module.controller("Fabric.AssignProfileController", ["$scope", "jolokia", "$location", "$routeParams", "workspace", "ProfileCart", ($scope, jolokia, $location, $routeParams, workspace, ProfileCart:Profile[]) => {

    $scope.profileId = $routeParams['pid'];
    $scope.versionId = $routeParams['vid'];

    if (ProfileCart.length > 0) {
      $scope.profileId = ProfileCart.map((p:Profile) => { return p.id; });
      $scope.versionId = (<Profile>ProfileCart.first()).versionId;
    }

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.containerIdFilter = '';

    var valid = true;

    if (!$scope.profileId) {
      log.debug("No profile ID specified, redirecting to app view");
      valid = false;
    }

    if (!$scope.versionId && valid) {
      log.debug("No version ID specified, redirecting to app view");
      valid = false;
    }

    if (!valid) {
      $location.path("/profiles");
    }

    $scope.gotoCreate = () => {
      var ids = $scope.profileId;
      if (angular.isArray(ids)) {
        ids = ids.join(',');
      }
      $location.path('/fabric/containers/createContainer').search({
        versionId: $scope.versionId,
        profileIds: ids
      });
    };

    $scope.$watch('containers', (newValue, oldValue) => {
      if (newValue !== oldValue && newValue) {
        $scope.selected = newValue.filter((c) => { return c['selected']});
      }
    }, true);

    $scope.assignProfiles = () => {
      var requests = [];
      var profileIds = $scope.profileId;
      if (!angular.isArray(profileIds)) {
        profileIds = [profileIds];
      }
      $scope.selected.forEach((c) => {
        requests.push({
          type: 'exec', mbean: Fabric.managerMBean,
          operation: 'addProfilesToContainer',
          arguments: [c.id, profileIds]
        });
      });
      //notification('info', "Applying " + $scope.profileId + " to the selected containers");
      var outstanding = requests.length;
      jolokia.request(requests, onSuccess(() => {
        outstanding = outstanding - 1;
        if (outstanding === 0) {
          notification('success', "Applied " + $scope.profileId);
          SelectionHelpers.clearGroup(ProfileCart);
          Core.$apply($scope);
        }
      }));
      setTimeout(() => {
        $location.path("/fabric/containers");
        Core.$apply($scope);
      }, 30);
    }
  }]);
}
