module Fabric {

  export function FabricViewController($scope, $location, jolokia, localStorage, workspace) {

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.containerArgs = ["id", "alive", "parentId", "profileIds", "versionId", "provisionResult", "jolokiaUrl", "root"];
    $scope.containersOp = 'containers(java.util.List)';
    $scope.ensembleContainerIdListOp = 'EnsembleContainers';

    $scope.init = () => {

      var activeVersionId = $location.search()['cv'];
      if (activeVersionId) {
        $scope.activeVersionId = activeVersionId;
        $scope.activeVersion = {
          id: $scope.activeVersionId
        };
      }

      var profiles = $location.search()['sp'];
      $scope.selectedProfileIds = [];
      if (profiles) {
        $scope.selectedProfileIds = profiles.split(',');
      }

      var containers = $location.search()['sc'];
      $scope.selectedContainerIds = [];
      if (containers) {
        $scope.selectedContainerIds = containers.split(',');
      }

    };

    $scope.versions = [];
    $scope.profiles = [];
    $scope.containers = [];
    $scope.activeProfiles = [];

    $scope.activeVersion = {};
    $scope.activeVersionId = '';
    $scope.selectedContainers = [];
    $scope.selectedProfiles = [];
    $scope.selectedActiveProfiles = [];

    $scope.dialogProfiles = [];

    $scope.profileIdFilter = '';
    $scope.activeProfileIdFilter = '';
    $scope.containerIdFilter = '';

    $scope.filterActiveVersion = false;
    $scope.filterActiveProfile = false;

    $scope.deleteVersionDialog = new UI.Dialog();
    $scope.deleteProfileDialog = new UI.Dialog();
    $scope.createProfileDialog = new UI.Dialog();

    $scope.ensembleContainerIds = [];
    $scope.profileSelectedAll = false;

    $scope.targetContainer = {};


    // Tweaks to ensure ng-grid displays on dialogs
    $scope.triggerResize = () => {
      setTimeout(function() {
        $('.dialogGrid').trigger('resize');
      }, 10);

    };

    /*
    $scope.$watch('createProfileDialog', function() {
      if ($scope.createProfileDialog) {
        $scope.triggerResize();
      }
    });

    $scope.$watch('createVersionDialog', function() {
      if ($scope.createVersionDialog) {
        $scope.triggerResize();
      }
    });
    */

    // holders for dialog data
    $scope.newProfileName = '';
    $scope.selectedParents = [];
    $scope.selectedParentVersion = [];

    $scope.$on('$routeUpdate', $scope.init);

    // watchers for selection handling
    $scope.$watch('activeVersionId', (oldValue, newValue) => {
      $location.search('cv', $scope.activeVersionId);
    });


    $scope.$watch('activeVersion', (newValue, oldValue) => {
      if (newValue !== oldValue && $scope.activeVersion && $scope.activeVersion.id !== $scope.activeVersionId) {
        $scope.activeVersionId = $scope.activeVersion.id;
      }
    });


    $scope.$watch('containers', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedContainers = $scope.containers.filter((c) => { return c.selected; });

        if ($scope.selectedContainers.length > 0) {
          $scope.activeContainerId = '';
        }
      }      
    }, true);


    $scope.$watch('activeProfiles', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedActiveProfiles = $scope.activeProfiles.filter((ap) => { return ap.selected; });
      }
    }, true);


    $scope.$watch('selectedProfiles', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        var ids = $scope.getSelectedProfileIds().join(',');
        $location.search('sp', ids);
      }
    }, true);


    $scope.$watch('selectedContainers', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        var ids = $scope.getSelectedContainerIds().join(',');
        $location.search('sc', ids);
      }
    }, true);


    // initialize the scope after we set all our watches
    $scope.init();


    // create profile dialog action
    $scope.doCreateProfile = (newProfileName, selectedParents) => {
      $scope.newProfileName = newProfileName;
      $scope.createProfileDialog.close();
      var parents = selectedParents.map(function(profile) {return profile.id});
      createProfile(jolokia, $scope.activeVersionId, $scope.newProfileName, parents, function() {
        notification('success', "Created profile " + $scope.newProfileName);
        $scope.profileIdFilter = $scope.newProfileName;
        $scope.newProfileName = "";
        Core.$apply($scope);
      }, function(response) {
        notification('error', "Failed to create profile " + $scope.newProfileName + " due to " + response.error);
        Core.$apply($scope);
      });
    };



    // delete version dialog action
    $scope.deleteVersion = () => {
      var id = $scope.activeVersionId;

      jolokia.request({
        type: 'read',
        mbean: Fabric.managerMBean,
        attribute: 'DefaultVersion'
      }, onSuccess((response) => {
        $scope.activeVersionId = response.value;
        Core.$apply($scope);
        setTimeout(() => {
          deleteVersion(jolokia, id, () => {
            notification('success', "Deleted version " + id);
            Core.$apply($scope);
          }, (response) => {
            notification('error', "Failed to delete version " + id + " due to " + response.error);
            Core.$apply($scope);
          });
        }, 100);
      }));
    };

    $scope.deleteSelectedProfiles = () => {
      $scope.selectedProfiles.each(function(profile) {
        var profileId = profile.id;
        deleteProfile(jolokia, $scope.activeVersionId, profileId, function() {
          notification('success', "Deleted profile " + profileId);
        }, function(response) {
          notification('error', "Failed to delete profile " + profileId + ' due to ' + response.error);
        })
      });
    };

    $scope.patchVersion = (versionId) => {
      $location.url('/fabric/patching').search({versionId: versionId});
    };


    $scope.migrateVersion = (targetName, sourceName) => {
      notification('info', "Moving " + targetName + " to " + sourceName);

      migrateContainers(jolokia, sourceName, [targetName], () => {
        notification('success', "Moved " + targetName + " to version " + sourceName);
      }, (response) => {
        notification('error', "Failed to move " + targetName + " to version " + sourceName + " due to " + response.error);
      });
    }


    $scope.addProfiles = (targetName, profiles) => {
      notification('info', "Adding " + profiles.join(', ') + " to " + targetName);

      addProfilesToContainer(jolokia, targetName, profiles, () => {
        notification('success', "Added " + profiles.join(', ') + " to " + targetName);
      }, (response) => {
        notification('error', "Failed to add " + profiles.join(', ') + " to " + targetName + " due to " + response.error);
      });
    };


    $scope.removeActiveProfiles = () => {
      $scope.selectedActiveProfiles.each((profile) => {
        $scope.removeActiveProfile(profile);
      });
    };


    $scope.removeActiveProfile = (profile) => {
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

    $scope.getFilteredName = (item) => {
      return item.versionId + " / " + item.id;
    }


    $scope.filterContainer = (container) => {

      if (!$scope.getFilteredName(container).has($scope.containerIdFilter)) {
        return false;
      }

      if ($scope.selectedActiveProfiles.length > 0) {

        if ($scope.selectedActiveProfiles.none( (ap) => {
          //console.log("Checking ap: ", ap, " container: ", container);
          return ap.versionId === container.versionId && 
            container.profileIds.some(ap.id);
        })) {
          return false;
        }
      }

      return true;
    };


    $scope.filterActiveProfile = (profile) => {

      if (!$scope.getFilteredName(profile).has($scope.activeProfileIdFilter)) {
        return false;
      }

      if ($scope.filterActiveVersion && 
          $scope.activeVersionId && 
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


    $scope.showMigrateButton = () => {
      return $scope.selectedContainers.length > 0 && $scope.activeVersionId && $scope.activeVersionId !== '';
    };


    $scope.applyVersionToContainers = () => {
      $scope.selectedContainers.each((c) => {
        $scope.migrateVersion(c.id, $scope.activeVersionId);
      });
    };


    $scope.showProfileAddButton = () => {
      return $scope.selectedProfiles.length > 0 && 
             $scope.selectedContainers.length > 0 && 
             $scope.selectedContainers.every((c) => { return c.versionId === $scope.activeVersionId });
    };


    $scope.addProfilesToContainers = () => {

      var profileIds = $scope.selectedProfiles.map((p) => { return p.id });

      $scope.selectedContainers.each((c) => {
        $scope.addProfiles(c.id, profileIds);
      });
    }


    $scope.versionCanBeDeleted = () => {
      return $scope.containers.none((c) => { return c.versionId === $scope.activeVersionId });
    };


    $scope.profilesCanBeDeleted = () => {

      var possibleMatches = $scope.containers.filter((c) => { return c.versionId === $scope.activeVersionId });

      if (possibleMatches.length === 0) {
        return true;
      }

      possibleMatches = possibleMatches.filter( (c) => { return $scope.selectedProfiles.some((p) => { return c.profileIds.some(p.id)})});

      if (possibleMatches.length === 0) {
        return true;
      }
      return false;
    };


    $scope.getSelectedProfileIds = () => {
      return $scope.getIds($scope.selectedProfiles);
    };


    $scope.getSelectedContainerIds = () => {
      return $scope.getIds($scope.selectedContainers);
    };


    $scope.getIds = (arr) => {
      return arr.map((o) => { return o.id; });
    }

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


    $scope.isSelectedVersion = (id) => {
      if ($scope.activeVersionId === id) {
        return 'selected';
      }
      return '';
    };

    $scope.getSelectedClass = (obj) => {
      var answer = [];
      if (obj.selected) {
        answer.push('selected');
      }
      if (angular.isDefined(obj['root']) && obj['root'] === false) {
        answer.push('child-container');
      }
      return answer.join(' ');
    };


    $scope.setActiveVersionId = (id) => {
      $scope.activeVersionId = id;
    };


    $scope.showProfile = (profile) => {
      if (angular.isDefined(profile.versionId)) {
        Fabric.gotoProfile(workspace, jolokia, localStorage, $location, profile.versionId, profile);
      } else {
        Fabric.gotoProfile(workspace, jolokia, localStorage, $location, $scope.activeVersionId, profile);
      }
    };

  }
}
