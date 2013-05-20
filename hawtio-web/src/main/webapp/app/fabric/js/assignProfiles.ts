module Fabric {

  export function AssignProfilesController($scope, jolokia, $location) {

    $scope.defaultVersion = jolokia.execute(managerMBean, "defaultVersion()");
    $scope.version = { id: $scope.defaultVersion.id };

    $scope.versions = [];
    $scope.profiles = [];
    $scope.containers = [];
    $scope.versionResponse = [];
    $scope.profileIds = [];
    $scope.containerIds = [];

    $scope.selectedProfiles = [];
    $scope.selectedContainers = [];

    $scope.showApply = false;

    $scope.profileGridOptions = {
      data: 'profiles',
      selectedItems: $scope.selectedProfiles,
      showSelectionCheckbox: true,
      multiSelect: true,
      keepLastSelected: false,
      columnDefs: [{
        field: 'id',
        displayName: 'Profile Name'
      }],
      sortInfo: { fields: ['id'], directions: ['asc'] },
      filterOptions: {
        filterText: ''
      }
    };

    $scope.containerGridOptions = {
      data: 'containers',
      selectedItems: $scope.selectedContainers,
      showSelectionCheckbox: true,
      multiSelect: true,
      keepLastSelected: false,
      columnDefs: [{
        field: 'id',
        displayName: 'Container Name'
      }],
      sortInfo: { fields: ['id'], directions: ['asc'] },
      filterOptions: {
        filterText: ''
      }
    };

    $scope.canApply = () => {
      return !($scope.selectedProfiles.length > 0 && $scope.selectedContainers.length > 0);
    }

    $scope.applyProfiles = () => {
      var containerIds = $scope.selectedContainers.map((container) => { return container.id });
      var profileIds = $scope.selectedProfiles.map((profile) => { return profile.id });
      var versionId = $scope.version.id;

      notification('info', "Applying profiles to containers");
      $location.path("/fabric/containers");

      applyProfiles(jolokia, versionId, profileIds, containerIds, () => {
        notification('success', "Successfully applied profiles");
      }, (response) => {
        notification('error', "Failed to apply profiles due to " + response.error);
      });
    }

    $scope.render = (response) => {

      switch(response.request.operation) {
        case 'versions()':
          if (!Object.equal($scope.versionResponse, response.value)) {
            $scope.versionResponse = response.value
            $scope.versions = response.value.map(function(version) {
              var v = {
                id: version.id,
                'defaultVersion': version.defaultVersion
              }

              if (v['defaultVersion']) {
                $scope.defaultVersion = v;
              }

              return v;
            });
            $scope.version = setSelect($scope.version, $scope.versions);

            $scope.$apply();
          }
          break;

        case 'getProfileIds(java.lang.String)':
            if (!Object.equal($scope.profileIds, response.value)) {
              $scope.profileIds = response.value;
              $scope.profiles = [];

              $scope.profileIds.each((profile) => {
                $scope.profiles.push({
                  id: profile
                });
              });

              $scope.$apply();
            }
          break;

        case 'containerIdsForVersion(java.lang.String)':
          if (!Object.equal($scope.containerIds, response.value)) {
            $scope.containerIds = response.value;
            $scope.containers = [];

            $scope.containerIds.each((container) => {
              $scope.containers.push({
                id: container
              });
            });

            $scope.$apply();
          }

          break;

      }
    };

    $scope.$watch('version', (oldValue, newValue) => {

      if (oldValue === newValue) {
        notification('info', "Please wait, fetching data for version " + $scope.version.id);
      }

      Core.unregister(jolokia, $scope);
      Core.register(jolokia, $scope, [
        {type: 'exec', mbean: managerMBean, operation: 'versions()'},
        {type: 'exec', mbean: managerMBean, operation: 'getProfileIds(java.lang.String)', arguments: [$scope.version.id]},
        {type: 'exec', mbean: managerMBean, operation: 'containerIdsForVersion(java.lang.String)', arguments: [$scope.version.id]}
      ], onSuccess($scope.render));
    });

  }

}
