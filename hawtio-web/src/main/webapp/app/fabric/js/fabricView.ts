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
    $scope.profiles = [];
    $scope.containers = [];
    $scope.activeProfiles = [];

    $scope.selectedVersion = {};
    $scope.selectedContainers = [];
    $scope.selectedProfiles = [];
    $scope.selectedActiveProfiles = [];

    $scope.dialogProfiles = [];

    $scope.profileIdFilter = '';
    $scope.activeProfileIdFilter = '';
    $scope.containerIdFilter = '';

    $scope.filterActiveVersion = false;
    $scope.filterActiveProfile = false;

    $scope.deleteVersionDialog = false;
    $scope.deleteProfileDialog = false;
    $scope.createProfileDialog = false;
    $scope.createVersionDialog = false;

    // Data for profile/version creation dialogs
    $scope.createProfileGridOptions = {
      data: 'profiles',
      selectedItems: $scope.selectedParents,
      showSelectionCheckbox: true,
      multiSelect: true,
      selectWithCheckboxOnly: false,
      keepLastSelected: false,
      columnDefs: [
        {
          field: 'id',
          displayName: 'Name'
        }]
    };

    $scope.createVersionGridOptions = {
      data: 'versions',
      selectedItems: $scope.selectedParentVersion,
      showSelectionCheckbox: true,
      multiSelect: false,
      selectWithCheckboxOnly: false,
      keepLastSelected: false,
      columnDefs: [
        {
          field: 'id',
          displayName: 'Name'
        }]
    };


    // Tweaks to ensure ng-grid displays on dialogs
    $scope.triggerResize = () => {
      setTimeout(function() {
        $('.dialogGrid').trigger('resize');
      }, 10);

    };

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

    // holders for dialog data
    $scope.newProfileName = '';
    $scope.newVersionName = '';
    $scope.selectedParents = [];
    $scope.selectedParentVersion = [];


    // watchers for selection handling
    $scope.$watch('activeVersionId', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.profiles = $scope.currentVersionProfiles($scope.activeVersionId);
        if ($scope.activeVersionId === '') {
          $scope.activeProfileId = '';
          $scope.profiles = [];
        }
      }
    });


    $scope.$watch('profiles', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        if ($scope.profiles.length === 0) {
          $scope.selectedProfiles = [];
        } else {
          $scope.selectedProfiles = $scope.profiles.filter((p) => { return p.selected; });
          if ($scope.selectedProfiles.length > 0) {
            $scope.activeProfileId = '';
          }
        }

      }
    }, true);


    $scope.$watch('containers', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedContainers = $scope.containers.filter((c) => { return c.selected; });

        if ($scope.selectedContainers.length > 0) {
          $scope.activeContainerId = '';
          //$scope.activeVersionId = '';
        }
      }      
    }, true);


    $scope.$watch('activeProfiles', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedActiveProfiles = $scope.activeProfiles.filter((ap) => { return ap.selected; });
      }
    }, true);


    // drag/drop handling
    $scope.handleDrop = (event, element) => {

      //console.log("event: ", event);
      //console.log("element: ", element);

      var sourceElement = element.draggable.get(0);
      var targetElement = event.target;

      //console.log("sourceElement: ", sourceElement);
      //console.log("targetElement: ", targetElement);

      var temp = targetElement.id.split('#');

      var targetType = temp[0];
      var targetName = temp[1];

      temp = sourceElement.id.split('#');

      var sourceType = temp[0];
      var sourceName = temp[1];

      switch(targetType) {
        case 'container':
          $scope.alterContainer(targetName, sourceType, sourceName);
          break;
      }

    };


    // create profile dialog action
    $scope.doCreateProfile = () => {
      $scope.createProfileDialog = false;
      var parents = $scope.selectedParents.map(function(profile) {return profile.id});
      createProfile(jolokia, $scope.activeVersionId, $scope.newProfileName, parents, function() {
        notification('success', "Created profile " + $scope.newProfileName);
        $scope.profileIdFilter = $scope.newProfileName;
        $scope.newProfileName = "";
        $scope.$apply();
      }, function(response) {
        notification('error', "Failed to create profile " + $scope.newProfileName + " due to " + response.error);
        $scope.$apply();
      });
    };


    // create version dialog action
    $scope.doCreateVersion = () => {
      $scope.createVersionDialog = false;

      var success = function (response) {
        notification('success', "Created version " + response.value.id);
        $scope.newVersionName = '';
        $scope.$apply();
      };

      var error = function (response) {
        var msg = "Error creating new version: " + response.error;
        if ($scope.newVersionName !== '') {
          msg = "Error creating " + $scope.newVersionName + " : " + response.error;
        }
        notification('error', msg);
      };

      if ($scope.selectedParentVersion.length > 0 && $scope.newVersionName !== '') {
        createVersionWithParentAndId(jolokia, $scope.selectedParentVersion[0].id, $scope.newVersionName, success, error);
      } else if ($scope.newVersionName !== '') {
        createVersionWithId(jolokia, $scope.newVersionName, success, error);
      } else {
        createVersion(jolokia, success, error);
      }
    };


    // delete version dialog action
    $scope.deleteVersion = () => {

      deleteVersion(jolokia, $scope.version.id, function() {
        notification('success', "Deleted version " + $scope.version.id);
        $scope.$apply();
      }, function(response) {
        notification('error', "Failed to delete version " + $scope.version.id + " due to " + response.error);
        $scope.$apply();
      });
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
      $scope.activeProfileId = '';
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

      if (!container.id.startsWith($scope.containerIdFilter, 0, false)) {
        return false;
      }

      if ($scope.selectedActiveProfiles.length > 0) {

        if ($scope.selectedActiveProfiles.none( (ap) => {
          console.log("Checking ap: ", ap, " container: ", container);
          return ap.versionId === container.versionId && 
            container.profileIds.some(ap.id);
        })) {
          return false;
        }
      }

      return true;
    };


    $scope.filterActiveProfile = (profile) => {

      if (!profile.id.startsWith($scope.activeProfileIdFilter, 0, false)) {
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


    $scope.currentVersionProfiles = (id) => {
      if (id === '') {
        return [];
      }
      var version = $scope.versions.find((version) => { return version.id === $scope.activeVersionId });
      if (!version) {
        return [];
      }

      var answer = [];

      version.profiles.each((p) => {

        var profile = $scope.profiles.find((prof) => { return p === prof.id });

        var selected = false;
        if (profile && profile.version === version.id) {
          selected = profile.selected;
        }

        answer.push({
          id: p,
          versionId: version.id,
          selected: selected
        });
      });



      return answer;
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
              containers: [container.id],
              selected: false
            });
          }
        });
      });

      return answer;
    };


    $scope.statusIcon = (row) => {
      if (row) {
        if (row.alive) {
          switch(row.provisionResult) {
            case 'success':
              return "green icon-play-circle";
            case 'downloading':
              return "icon-download-alt";
            case 'installing':
              return "icon-hdd";
            case 'analyzing':
            case 'finalizing':
              return "icon-refresh icon-spin";
            case 'resolving':
              return "icon-sitemap";
            case 'error':
              return "red icon-warning-sign";
          }
        } else {
          return "orange icon-off";
        }
      }
      return "icon-refresh icon-spin";
    };



    $scope.connect = (row) => {
      if (row) {
        // TODO lets find these from somewhere! :)
        var userName = "admin";
        var password = "admin";
        Fabric.connect(row, userName, password, true);
      }
    };


    $scope.getTitle = (container) => {
      var answer = 'Alive';

      if (!container.alive) {
        answer = 'Not Running';
      } else {
        answer += ' - ' + humanizeValue(container.provisionResult);
      }

      return answer;
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
      if (obj.selected) {
        return 'selected';
      }
      return '';
    };


    $scope.setActiveVersionId = (id) => {
      $scope.activeVersionId = id;
    };


    $scope.clearSelection = (group) => {
      group.each((item) => { item.selected = false; });
    };


    $scope.setActiveProfile = (profile) => {
      $scope.clearSelection($scope.activeProfiles);
      if (!profile || profile === null) {
        return;
      }
      profile.selected = true;
    };


    $scope.selectAllContainers = () => {
      $scope.containers.each((container) => { 
        if ($scope.filterContainer(container)) {
          container.selected = true;
        }
      });
    };


    $scope.setActiveContainer = (container) => {
      $scope.clearSelection($scope.containers);
      if (!container || container === null) {
        return;
      }
      container.selected = true;
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
        var activeProfiles = $scope.activeProfiles;
        $scope.activeProfiles = $scope.currentActiveProfiles();
        $scope.activeProfiles.each((activeProfile) => {

          var ap = activeProfiles.find((ap) => { return ap.id === activeProfile.id && ap.versionId === activeProfile.versionId });
          if (ap) {
            activeProfile['selected'] = ap.selected;
          } else {
            activeProfile['selected'] = false;
          }

        });
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
