module Fabric {

  export function ProfileController($scope, $routeParams, jolokia, $location, workspace:Workspace, $q) {

    Fabric.initScope($scope, workspace);

    $scope.loading = true;

    $scope.mavenMBean = Maven.getMavenIndexerMBean(workspace);

    if (!angular.isDefined($scope.versionId)) {
      $scope.versionId = $routeParams.versionId;
    }
    if (!angular.isDefined($scope.profileId)) {
      $scope.profileId = $routeParams.profileId;
    }

    $scope.newFileDialog = false;
    $scope.deleteFileDialog = false;
    $scope.newFileName = '';
    $scope.markedForDeletion = '';

    $scope.newProfileName = '';
    $scope.addThingDialog = false;
    $scope.deleteThingDialog = false;
    $scope.changeParentsDialog = false;
    $scope.removeParentDialog = false;
    $scope.newThingName = '';
    $scope.selectedParents = [];

    $scope.profilePath = Fabric.profilePath;

    $scope.$watch('versionId', (newValue, oldValue) => {
      Core.unregister(jolokia, $scope);
      if (angular.isDefined($scope.versionId) && angular.isDefined($scope.profileId)) {
        $scope.doRegister();
      }
    });

    $scope.$watch('profileId', (newValue, oldValue) => {
      Core.unregister(jolokia, $scope);
      if (angular.isDefined($scope.versionId) && angular.isDefined($scope.profileId)) {
        $scope.doRegister();
      }
    });

    $scope.doRegister = () => {
      if ($scope.versionId && $scope.profileId && !$scope.versionId.isBlank() && !$scope.profileId.isBlank()) {
        Core.register(jolokia, $scope, {
          type: 'exec', mbean: managerMBean,
          operation: 'getProfile(java.lang.String, java.lang.String)',
          arguments: [$scope.versionId, $scope.profileId]
        }, onSuccess(render));
      }
    };

    $scope.showChangeParentsDialog = () => {
      $scope.selectedParents = $scope.row.parentIds.map((parent) => {
        return {
          id: parent,
          selected: true
        };
      });
      $scope.changeParentsDialog = true;
    }

    $scope.removeParentProfile = (parent) => {
      $scope.markedForDeletion = parent;
      $scope.removeParentDialog = true;

    }

    $scope.doRemoveParentProfile = () => {
      var parents = $scope.row.parentIds.exclude($scope.markedForDeletion);
      changeProfileParents(jolokia, $scope.versionId, $scope.profileId, parents, () => {
        notification('success', 'Removed parent profile ' + $scope.markedForDeletion + ' from ' + $scope.profileId);
        Core.$apply($scope);
      }, (response) => {
        notification('error', 'Failed to change parent profiles of ' + $scope.profileId + ' due to ' + response.error);
        Core.$apply($scope);
      });
    }


    $scope.doChangeParents = () => {
      $scope.changeParentsDialog = false;
      var parents = $scope.selectedParents.map((parent) => {
        return parent.id;
      });
      changeProfileParents(jolokia, $scope.versionId, $scope.profileId, parents, () => {
        notification('success', 'Successfully changed parent profiles of ' + $scope.profileId);
        Core.$apply($scope);
      }, (response) => {
        notification('error', 'Failed to change parent profiles of ' + $scope.profileId + ' due to ' + response.error);
        Core.$apply($scope);
      });
    }


    $scope.goto = (location) => {
      $location.url(location);
    }

    $scope.addNewThing = (title, type, current) => {
      $scope.thingName = title;
      $scope.currentThing = current;
      $scope.currentThingType = type;
      $scope.addThingDialog = true;
    }

    $scope.deleteThing = (title, type, current, item) => {
      $scope.thingName = title;
      $scope.currentThing = current;
      $scope.currentThingType = type;
      $scope.currentThingItem = item;
      $scope.deleteThingDialog = true;
    }

    $scope.updateThing = (title, type, current) => {
      $scope.thingName = title;
      $scope.currentThing = current;
      $scope.currentThingType = type;
      $scope.callSetProfileThing("Changed", "change", title);
    }

    $scope.callSetProfileThing = function (success, error, thing) {
      jolokia.request({
        type: 'exec',
        mbean: managerMBean,
        operation: "setProfile" + $scope.currentThingType + "(java.lang.String, java.lang.String, java.util.List)",
        arguments: [$scope.versionId, $scope.profileId, $scope.currentThing]
      }, {
        method: 'POST',
        success: () => {
          notification('success', success + ' ' + thing);
          $scope.newThingName = '';
          Core.$apply($scope);
        },
        error: (response) => {
          notification('error', 'Failed to ' + error + ' ' + thing + ' due to ' + response.error);
          Core.$apply($scope);
        }
      });
    };


    $scope.doDeleteThing = () => {
      $scope.currentThing.remove($scope.currentThingItem);
      $scope.callSetProfileThing('Deleted', 'delete', $scope.currentThingItem);
    }


    $scope.doAddThing = () => {
      if (!$scope.currentThing.any($scope.newThingName)) {

        $scope.currentThing.push($scope.newThingName);
        $scope.addThingDialog = false;
        $scope.callSetProfileThing('Added', 'add', $scope.newThingName);

      } else {
        notification('error', 'There is already a ' + $scope.thingName + ' with the name ' + $scope.newThingName);
      }
    }


    $scope.deleteFile = (file) => {
      $scope.markedForDeletion = file;
      $scope.deleteFileDialog = true;
    };

    $scope.doDeleteFile = () => {
      $scope.deleteFileDialog = false;
      deleteConfigFile(jolokia, $scope.versionId, $scope.profileId, $scope.markedForDeletion, () => {
        notification('success', 'Deleted file ' + $scope.markedForDeletion);
        $scope.markedForDeletion = '';
        Core.$apply($scope);
      }, (response) => {
        notification('error', 'Failed to delete file ' + $scope.markedForDeletion + ' due to ' + response.error);
        $scope.markedForDeletion = '';
        Core.$apply($scope);
      });
    };

    $scope.doCreateFile = () => {
      $scope.newFileDialog = false;
      newConfigFile(jolokia, $scope.versionId, $scope.profileId, $scope.newFileName, () => {
        notification('success', 'Created new configuration file ' + $scope.newFileName);
        $location.path("/fabric/profile/" + $scope.versionId + "/" + $scope.profileId + "/" + $scope.newFileName);
      }, (response) => {
        notification('error', 'Failed to create ' + $scope.newFileName + ' due to ' + response.error);
      })
    };

    $scope.copyProfile = () => {
      $scope.copyProfileDialog = false;
      notification('info', 'Copying ' + $scope.profileId + ' to ' + $scope.newProfileName);

      copyProfile(jolokia, $scope.versionId, $scope.profileId, $scope.newProfileName, true, () => {
        notification('success', 'Created new profile ' + $scope.newProfileName);
        Fabric.gotoProfile(workspace, jolokia, localStorage, $location, $scope.versionId, {id: $scope.newProfileName });
        Core.$apply($scope);
      }, (response) => {
        notification('error', 'Failed to create new profile ' + $scope.newProfileName + ' due to ' + response.error);
        Core.$apply($scope);
      });
    }
    
    function render(response) {
      if (!angular.isDefined($scope.row)) {
        $scope.loading = false;
      }
      if (!Object.equal($scope.row, response.value)) {
        $scope.row = response.value;
        var id = $scope.row.id;
        var version = $scope.row.version;
        $scope.configFolderLink = null;
        if ($scope.hasFabricWiki() && id && version) {
          $scope.configFolderLink = "#/wiki/branch/" + version + "/view/fabric/profiles/" + Fabric.profilePath(id);
        }
        Core.$apply($scope);
      }
    }
  }
}
