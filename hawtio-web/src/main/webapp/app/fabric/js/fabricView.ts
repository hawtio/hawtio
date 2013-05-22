module Fabric {

  export function FabricViewController($scope, $location, jolokia) {

    $scope.containerArgs = ["id", "alive", "profileIds", "versionId", "provisionResult", "jolokiaUrl"];
    $scope.versionsOp = 'versions()';
    $scope.containersOp = 'containers(java.util.List)';

    $scope.activeVersionId = $location.search()['cv'];
    $scope.activeProfileId = $location.search()['cp'];
    $scope.activeContainerId = $location.search()['ac'];
    $scope.activeContainerVersion = $location.search()['acv'];


    $scope.versions = [];
    $scope.containers = [];
    $scope.selectedContainers = [];
    $scope.profiles = [];
    $scope.activeProfiles = [];


    $scope.$watch('activeVersionId', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.profiles = $scope.currentVersionProfiles($scope.activeVersionId);
        if ($scope.activeVersionId === '') {
          $scope.activeProfileId = '';
        }
      }
    });

    $scope.$watch('containers', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedContainers = $scope.containers.filter((c) => { return c.selected; });
      }      
    }, true);


    $scope.handleDrop = (event, element) => {

      var sourceElement = $(event.srcElement);
      var targetElement = $(event.target);

      var temp = targetElement.attr('class').split('#');

      var targetType = temp[0];
      var targetName = temp[1];

      temp = sourceElement.attr('class').split('#');

      var sourceType = temp[0];
      var sourceName = temp[1];

      switch(targetType) {
        case 'container':
          $scope.alterContainer(targetName, sourceType, sourceName);
          break;
      }

    };


    $scope.alterContainer = (targetName, sourceType, sourceName) => {
      switch(sourceType) {
        case 'profile':
            if ($scope.selectedContainers.length > 0) {
              $scope.selectedContainers.each((c) => {
                $scope.addProfile(c.id, sourceName);
              });
            } else {
              $scope.addProfile(targetName, sourceName);
            }

          break;
        case 'version':
            if ($scope.selectedContainers.length > 0) {
              $scope.selectedContainers.each((c) => {
                $scope.migrateVersion(c.id, sourceName);
              });
            } else {
              $scope.migrateVersion(targetName, sourceName);
            }

          break;
      }
    };


    $scope.migrateVersion = (targetName, sourceName) => {
      notification('info', "Moving " + targetName + " to " + sourceName);

      migrateContainers(jolokia, sourceName, [targetName], () => {
        notification('success', "Moved " + targetName + " to version " + sourceName);
      }, (response) => {
        notification('error', "Failed to move " + targetName + " to version " + sourceName + " due to " + response.error);
      });
    }


    $scope.addProfile = (targetName, sourceName) => {
      notification('info', "Adding " + sourceName + " to " + targetName);

      addProfilesToContainer(jolokia, targetName, [sourceName], () => {
        notification('success', "Added " + sourceName + " to " + targetName);
      }, (response) => {
        notification('error', "Failed to add " + sourceName + " to " + targetName + " due to " + response.error);
      });
    };


    $scope.removeActiveProfiles = (profile) => {
      if ($scope.selectedContainers.length > 0) {
        $scope.selectedContainers.each((container) => {
          if (container.profileIds.some(profile.id) && container.versionId === profile.versionId) {
            $scope.removeProfile(container.id, profile.id);
          }
        });
      } else {
        $scope.removeProfile($scope.activeContainerId, profile.id);
      }
    };


    $scope.removeProfile = (containerId, profileId) => {
      notification('info', "Removing " + profileId + " from " + containerId);

      removeProfilesFromContainer(jolokia, containerId, [profileId], () => {
        notification('success', "Removed " + profileId + " from " + containerId);
      }, (response) => {
        notification('error', "Failed to remove " + profileId + " from " + containerId + " due to " + response.error);
      });
    }


    $scope.filterContainer = (container) => {
      if ($scope.activeVersionId && 
          $scope.activeVersionId !== '' && 
          container.versionId !== $scope.activeVersionId) {
        return false;
      }

      if ($scope.activeProfileId && 
          $scope.activeProfileId !== '') {

        if (container.profileIds.count((profile) => {
              return profile === $scope.activeProfileId;
            }) === 0) {

          return false;

        }
      }
      return true;
    };


    $scope.filterActiveProfile = (profile) => {
      if ($scope.activeVersionId && 
          $scope.activeVersionId !== '' && 
          profile.versionId !== $scope.activeVersionId ) {
        return false;
      }

      if ($scope.selectedContainers.length > 0) {
        if ($scope.selectedContainers.none((c) => {
          return c.versionId === profile.versionId &&
            c.profileIds.some(profile.id);
        })) {
          return false;
        }
      }

      if ($scope.activeContainerId && 
          $scope.activeContainerId !== '') {

        if ($scope.activeContainerVersion && 
            $scope.activeContainerVersion !== '' && 
            $scope.activeContainerVersion !== profile.versionId) {
          return false;
        }
        if (!profile.containers.some($scope.activeContainerId)) {
          return false;
        }
      }
      return true;
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
            activeProfile.containers = activeProfile.containers.include(container.id).unique();
          } else {
            answer.push({
              id: profile,
              count: 1,
              versionId: container.versionId,
              containers: [container.id]
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
      var profile = $scope.currentActiveProfiles().find((profile) => { return profile.versionId === $scope.activeVersionId && profile.id === id });
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
      $scope.activeProfileId = '';
    };


    $scope.setActiveProfile = (profile) => {
      if (!profile || profile === null) {
        $scope.activeProfileId = '';
        $scope.activeVersionId = '';
        return;
      }
      $scope.activeProfileId = profile.id;
      $scope.activeVersionId = profile.versionId;
    };


    $scope.setActiveContainer = (container) => {
      if (!container || container === null) {
        $scope.activeContainerId = '';
        $scope.activeContainerVersion = '';
        return;
      }
      $scope.activeContainerId = container.id;
      $scope.activeContainerVersion = container.versionId;
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

        newContainers.each((container) => {
          var c = $scope.containers.find((c) => { return c.id === container.id; });
          if (c) {
            container['selected'] = c.selected;
          } else {
            container['selected'] = false;
          }
        });


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
