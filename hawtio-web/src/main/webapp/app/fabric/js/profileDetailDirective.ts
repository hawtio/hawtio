/// <reference path="fabricPlugin.ts"/>
/// <reference path="../../maven/js/mavenHelpers.ts"/>
module Fabric {

  export class ProfileDetails {
    public restrict = 'A';
    public replace = true;
    public templateUrl = Fabric.templatePath + "profileDetailsDirective.html";

    public scope = {
      versionId: '=',
      profileId: '='
    };

    public controller = ["$scope", "$element", "$attrs", "$routeParams", "jolokia", "$location", "workspace", "$q", ($scope, $element, $attrs, $routeParams, jolokia, $location, workspace, $q) => {

      $scope.inDirective = true;

      Fabric.initScope($scope, $location, jolokia, workspace);
      Fabric.loadRestApi(jolokia, $scope);

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
      $scope.deleteThingDialog = false;
      $scope.changeParentsDialog = false;
      $scope.removeParentDialog = false;
      $scope.newThingName = '';
      $scope.selectedParents = [];

      $scope.profilePath = Fabric.profilePath;
      $scope.pageId = fabricTopLevel + Fabric.profilePath($scope.profileId);

      $scope.gotoCreateContainer = () => {
        var me = $location.url();
        $location.url('/fabric/containers/createContainer').search({
          versionId: $scope.versionId,
          profileIds: $scope.profileId,
          hideProfileSelector: true,
          returnTo: me
        });
      };

      var versionId = $scope.versionId;
      var profileId = $scope.profileId;
      if (versionId && versionId) {
        Fabric.profileJolokia(jolokia, profileId, versionId, (profileJolokia) => {
          $scope.profileJolokia = profileJolokia;
          if (!profileJolokia) {
            // lets deal with the case we have no profile running right now so we have to have a plan B
            // for fetching the profile configuration metadata
            $scope.profileNotRunning = true;
            $scope.profileMetadataMBean = Osgi.getProfileMetadataMBean(workspace);
          }
        });
      }

      if ($scope.inDirective &&
          angular.isDefined($scope.$parent.childActions) &&
          $scope.versionId) {
        var actions = $scope.$parent.childActions;

        if ($scope.profileId) {
          actions.push({
            doAction: () => {
              $scope.showChangeParentsDialog();
            },
            title: "Edit parent profiles",
            icon: "icon-edit",
            name: "Change Parents"
          });
          actions.push({
            doAction: () => {
              $scope.copyProfileDialog = true;
            },
            title: "Copy Profile",
            icon: "icon-copy",
            name: "Copy Profile"
          });
          actions.push({
            doAction: () => {
              $scope.goto('/wiki/profile/' + $scope.versionId + '/' + $scope.profileId + '/editFeatures');
            },
            title: "Edit the features defined in this profile",
            icon: "icon-edit",
            name: "Edit Features"
          });
          actions.push({
            doAction: () => {
              $location.url('/fabric/assignProfile').search({
                vid: $scope.versionId,
                pid: $scope.profileId
              });
            },
            title: "Assign profile to existing containers",
            icon: "icon-truck",
            name: "Assign to Container"
          });
          actions.push({
            doAction: $scope.gotoCreateContainer,
            title: "Create a new container with this profile",
            icon: "icon-truck",
            name: "New Container"
          });
        }
      }

      $scope.$watch('activeTab', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.newThingName = '';
        }
      });

      $scope.$watch('versionId', (newValue, oldValue) => {
        if (angular.isDefined($scope.versionId) && angular.isDefined($scope.profileId)) {
          $scope.doRegister();
        }
      });

      $scope.$watch('profileId', (newValue, oldValue) => {
        if (angular.isDefined($scope.versionId) && angular.isDefined($scope.profileId)) {
          $scope.doRegister();
        }
      });

      // TODO, should complete URL handlers too
      $scope.doCompletionFabric = (something) => {
        if (something.startsWith("mvn:")) {
          $scope.prefix = "mvn:";
          return Maven.completeMavenUri($q, $scope, workspace, jolokia, something.from(4));
        }
        $scope.prefix = "";
        return $q.when([]);
      };

      $scope.uriParts = [];

      $scope.$watch('newThingName', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.uriParts = newValue.split("/");
        }
      });

      $scope.$watch('uriParts', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if (!$scope.prefix || $scope.prefix === '') {
            return;
          }
          if (newValue && newValue.length > 0 && !newValue.first().startsWith($scope.prefix)) {
            /*
            console.log("newValue: ", newValue);
            console.log("oldValue: ", oldValue);
            console.log("prefix: ", $scope.prefix);
            */
            if (newValue.first() === "" || newValue.first().length < $scope.prefix.length) {
              return;
            }
            if (oldValue.length === 0) {
              return;
            }
            // a completion occurred...
            if (oldValue.length === 1) {
              $scope.newThingName = $scope.prefix + newValue.first();
            } else {
              var merged = oldValue.first(oldValue.length - 1).include(newValue.first());
              $scope.newThingName = merged.join('/');
            }
          }
        }
      }, true);

      $scope.doRegister = () => {
        Core.unregister(jolokia, $scope);
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
      };

      $scope.removeParentProfile = (parent) => {
        $scope.markedForDeletion = parent;
        $scope.removeParentDialog = true;

      };

      $scope.doRemoveParentProfile = () => {
        var parents = $scope.row.parentIds.exclude($scope.markedForDeletion);
        changeProfileParents(jolokia, $scope.versionId, $scope.profileId, parents, () => {
          Core.notification('success', 'Removed parent profile ' + $scope.markedForDeletion + ' from ' + $scope.profileId);
          Core.$apply($scope);
        }, (response) => {
          Core.notification('error', 'Failed to change parent profiles of ' + $scope.profileId + ' due to ' + response.error);
          Core.$apply($scope);
        });
      };


      $scope.changeAttribute = (attribute, value) => {
        jolokia.request({
          type: 'exec',
          method: 'post',
          mbean: Fabric.managerMBean,
          operation: 'setProfileAttribute',
          arguments: [$scope.versionId, $scope.profileId, attribute, value]
        }, {
          success: () => {
            // TODO - we're secretly hiding that the ng-click event is firing twice...
            // notification('success', "Set attribute " + attribute + " to " + value);
            Core.$apply($scope);
          },
          error: (response) => {
            console.log("Failed to set attribute " + attribute + " to " + value + " due to " + response.error);
            // notification('error', "Failed to set attribute " + attribute + " to " + value + " due to " + response.error);
            Core.$apply($scope);
          }
        });
      };


      $scope.doChangeParents = () => {
        $scope.changeParentsDialog = false;
        var parents = $scope.selectedParents.map((parent) => {
          return parent.id;
        });
        changeProfileParents(jolokia, $scope.versionId, $scope.profileId, parents, () => {
          Core.notification('success', 'Successfully changed parent profiles of ' + $scope.profileId);
          Core.$apply($scope);
        }, (response) => {
          Core.notification('error', 'Failed to change parent profiles of ' + $scope.profileId + ' due to ' + response.error);
          Core.$apply($scope);
        });
      };


      $scope.goto = (location) => {
        $location.url(location);
      };

      $scope.addNewThing = (title, type, current) => {
        if (Core.isBlank($scope.newThingName)) {
          return;
        }
        $scope.thingName = title;
        $scope.currentThing = current;
        $scope.currentThingType = type;
        $scope.doAddThing();
      };

      $scope.deleteThing = (title, type, current, item) => {
        $scope.thingName = title;
        $scope.currentThing = current;
        $scope.currentThingType = type;
        $scope.currentThingItem = item;
        $scope.deleteThingDialog = true;
      };

      $scope.updateThing = (title, type, current) => {
        $scope.thingName = title;
        $scope.currentThing = current;
        $scope.currentThingType = type;
        $scope.callSetProfileThing("Changed", "change", title);
      };

      $scope.mavenLink = (url) => {
        return Maven.mavenLink(url);
      };


      $scope.callSetProfileThing = function (success, error, thing) {
        jolokia.request({
          type: 'exec',
          mbean: managerMBean,
          operation: "setProfile" + $scope.currentThingType + "(java.lang.String, java.lang.String, java.util.List)",
          arguments: [$scope.versionId, $scope.profileId, $scope.currentThing]
        }, {
          method: 'POST',
          success: () => {
            Core.notification('success', success + ' ' + thing);
            $scope.newThingName = '';
            Core.$apply($scope);
          },
          error: (response) => {
            Core.notification('error', 'Failed to ' + error + ' ' + thing + ' due to ' + response.error);
            Core.$apply($scope);
          }
        });
      };


      $scope.doDeleteThing = () => {
        $scope.currentThing.remove($scope.currentThingItem);
        $scope.callSetProfileThing('Deleted', 'delete', $scope.currentThingItem);
      };


      $scope.doAddThing = () => {
        if (!$scope.currentThing.any($scope.newThingName)) {

          $scope.currentThing.push($scope.newThingName);
          $scope.addThingDialog = false;
          $scope.callSetProfileThing('Added', 'add', $scope.newThingName);

        } else {
          Core.notification('error', 'There is already a ' + $scope.thingName + ' with the name ' + $scope.newThingName);
        }
      };


      $scope.deleteFile = (file) => {
        $scope.markedForDeletion = file;
        $scope.deleteFileDialog = true;
      };

      $scope.doDeleteFile = () => {
        $scope.deleteFileDialog = false;
        deleteConfigFile(jolokia, $scope.versionId, $scope.profileId, $scope.markedForDeletion, () => {
          Core.notification('success', 'Deleted file ' + $scope.markedForDeletion);
          $scope.markedForDeletion = '';
          Core.$apply($scope);
        }, (response) => {
          Core.notification('error', 'Failed to delete file ' + $scope.markedForDeletion + ' due to ' + response.error);
          $scope.markedForDeletion = '';
          Core.$apply($scope);
        });
      };

      $scope.doCreateFile = () => {
        $scope.newFileDialog = false;
        newConfigFile(jolokia, $scope.versionId, $scope.profileId, $scope.newFileName, () => {
          Core.notification('success', 'Created new configuration file ' + $scope.newFileName);
          $location.path("/fabric/profile/" + $scope.versionId + "/" + $scope.profileId + "/" + $scope.newFileName);
        }, (response) => {
          Core.notification('error', 'Failed to create ' + $scope.newFileName + ' due to ' + response.error);
        })
      };

      $scope.copyProfile = () => {
        $scope.copyProfileDialog = false;

        if ($scope.profileId.has('-') && !$scope.newProfileName.has('-')) {
          var parts = $scope.profileId.split('-');
          parts.pop();
          parts.push($scope.newProfileName);
          $scope.newProfileName = parts.join('-');
        }

        Core.notification('info', 'Copying ' + $scope.profileId + ' to ' + $scope.newProfileName);

        copyProfile(jolokia, $scope.versionId, $scope.profileId, $scope.newProfileName, true, () => {
          Core.notification('success', 'Created new profile ' + $scope.newProfileName);
          Fabric.gotoProfile(workspace, jolokia, localStorage, $location, $scope.versionId, {id: $scope.newProfileName });
          Core.$apply($scope);
        }, (response) => {
          Core.notification('error', 'Failed to create new profile ' + $scope.newProfileName + ' due to ' + response.error);
          Core.$apply($scope);
        });
      };
      
      function render(response) {
        if (!angular.isDefined($scope.row)) {
          $scope.loading = false;
        }
        var responseJson = angular.toJson(response.value);

        if ($scope.profileResponseJson !== responseJson) {
          if (!$scope.activeTab) {
            $scope.activeTab = "features";
          }
          $scope.profileResponseJson = responseJson;
          $scope.row = response.value;
          var id = $scope.row.id;
          var version = $scope.row.version;

          // extract system properties
          $scope.row.systemProperties = [];
          angular.forEach($scope.row.containerConfiguration, (v, k) => {
            if (k.startsWith("system.")) {
              $scope.row.systemProperties.push({ name: k.substring(7), value: v });
            }
          });

          $scope.sysPropsTableData = {
            rows: $scope.row.systemProperties
          };

          $scope.configFolderLink = null;
          if ($scope.hasFabricWiki() && id && version) {
            $scope.configFolderLink = "#/wiki/branch/" + version + "/view/fabric/profiles/" + Fabric.profilePath(id);
          }
          // lets resolve the icon to a fully qualified URL
          $scope.row.iconURL = Fabric.toIconURL($scope, response.value.iconURL);
          Core.$apply($scope);
        }
      }

      $scope.sysPropsTableConfig = {
        data: "sysPropsTableData.rows",
        multiSelect: false,
        showSelectionCheckbox: false,
        enableRowClickSelection: true,
        primaryKeyProperty: 'name',
        properties: {
          'rows' : {
            items: {
              properties: {
                'name': {
                  description: 'System property name',
                  type: 'java.lang.String'
                },
                'value': {
                  description: 'System property value',
                  type: 'java.lang.String'
                }
              }
            }
          }
        },
        displayFooter: false,
        showFilter: false,
        columnDefs: [
          { field: "name", displayName: "Name" },
          { field: "value", displayName: "Value" }
        ]
      };

      $scope.$on("hawtio.datatable.sysPropsTableData.rows", (ev, data) => {
        // TODO perform sane validation - or better during adding/updating the properties in hawtio-input-table...
        var props = {};
        angular.forEach(data, (v) => {
          props[v.name] = v.value;
        });
        jolokia.request({
          type: 'exec',
          mbean: managerMBean,
          operation: "setProfileSystemProperties(java.lang.String, java.lang.String, java.util.Map)",
          arguments: [$scope.versionId, $scope.profileId, props]
        }, {
          method: 'POST',
          success: () => {
            Core.notification('success', "System properties updated");
            Core.$apply($scope);
          },
          error: (response) => {
            Core.notification('error', 'Failed to update system properties due to ' + response.error);
            Core.$apply($scope);
          }
        });
      });

    }];

  }


}
