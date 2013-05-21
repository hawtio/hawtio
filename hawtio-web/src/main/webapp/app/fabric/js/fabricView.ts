module Fabric {

  export function FabricViewController($scope, jolokia) {

    $scope.containerArgs = ["id", "alive", "profileIds", "versionId", "provisionResult", "jolokiaUrl"];
    $scope.versionsOp = 'versions()';
    $scope.containersOp = 'containers(java.util.List)';

    $scope.activeVersionId = '';
    $scope.activeProfileId = '';
    $scope.versions = [];
    $scope.containers = [];

    $scope.profiles = [];
    $scope.activeProfiles = [];


    $scope.$watch('activeVersionId', () => {
      $scope.profiles = $scope.currentVersionProfiles($scope.activeVersionId);
    });

    $scope.handleDrop = (event, element) => {

      var sourceElement = $(event.srcElement);
      var targetElement = $(event.target);

      console.log("Source: ", sourceElement);
      console.log("target: ", targetElement);

      var temp = targetElement.attr('class').split('#');

      var targetType = temp[0];
      var targetName = temp[1];

      temp = sourceElement.attr('class').split('#');

      var sourceType = temp[0];
      var sourceName = temp[1];

      switch(targetType) {
        case 'container':

            switch(sourceType) {
              case 'profile':
                  addProfilesToContainer(jolokia, targetName, [sourceName], () => {
                    notification('success', "Added " + sourceName + " to " + targetName);
                  }, (response) => {
                    notification('error', "Failed to add " + sourceName + " to " + targetName + " due to " + response.error);
                  });
                break;
              case 'version':
                  migrateContainers(jolokia, sourceName, [targetName], () => {
                    notification('success', "Moved " + targetName + " to version " + sourceName);
                  }, (response) => {
                    notification('error', "Failed to move " + targetName + " to version " + sourceName + " due to " + response.error);
                  });
                break;
            }

          break;
      }

    };


    $scope.currentVersionProfiles = (id) => {
      if (id === '') {
        return [];
      }
      var version = $scope.versions.find((version) => { return version.id === $scope.activeVersionId });
      if (!version) {
        return [];
      }
      return version.profiles;
    };


    $scope.currentActiveProfiles = () => {
      var answer = [];

      $scope.containers.each((container) => {
        container.profileIds.each((profile) => {

          var activeProfile = answer.find((o) => { return o.versionId === container.versionId && o.id === profile });
          if (activeProfile) {
            activeProfile.count++;
          } else {
            answer.push({
              id: profile,
              count: 1,
              version: container.versionId
            });
          }
        });
      });

      return answer;
    };

    $scope.containersForVersion = (id) => {
      var count = $scope.containers.findAll((container) => { return container.versionId === id }).length;
      if (count === 0) {
        return '';
      }
      return "(" + count + ")";
    };


    $scope.containersForProfile = (id) => {
      var profile = $scope.currentActiveProfiles().find((profile) => { return profile.id === id });
      if (profile) {
        return "(" + profile.count + ")";
      } else {
        return "";
      }
    };


    $scope.setActiveProfileId = (id) => {
      $scope.activeProfileId = id;
    };


    $scope.setActiveVersionId = (id) => {
      $scope.activeVersionId = id;
    };


    $scope.updateVersions = (newVersions) => {
      var response = angular.toJson(newVersions);
      if ($scope.versionsResponse !== response) {
        $scope.versionsResponse = response;
        $scope.versions = newVersions;
        if ($scope.activeVersion !== '') {
          $scope.profiles = $scope.currentVersionProfiles($scope.activeVersion);
        }
        Core.$apply($scope);
      }
    };


    $scope.updateContainers = (newContainers) => {
      var response = angular.toJson(newContainers);
      if ($scope.containersResponse !== response) {
        $scope.containersResponse = response;
        $scope.containers = newContainers;
        $scope.activeProfiles = $scope.currentActiveProfiles();
        Core.$apply($scope);
      }
    };


    $scope.dispatch = (response) => {
      switch (response.request.operation) {
        case($scope.versionsOp):
          $scope.updateVersions(response.value);
          break;
        case($scope.containersOp):
          $scope.updateContainers(response.value);
          break;
      }
    };


    Core.register(jolokia, $scope, [
      {type: 'exec', mbean: managerMBean, operation: $scope.versionsOp },
      {type: 'exec', mbean: managerMBean, operation: $scope.containersOp, arguments: [$scope.containerArgs]}
    ], onSuccess($scope.dispatch));




  }
}
