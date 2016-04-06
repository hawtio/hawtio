/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="./fabricInterfaces.ts"/>
/// <reference path="./fabricHelpers.ts"/>
module Fabric {

  // this holds lazily created dialog configs
  var dialogConfigs = {};

  export interface CreateLocationDialogOptions {
    selectedContainers: () => Array<Container>;
    callbacks: () => JolokiaCallbacks;
  }

  export function getCreateLocationDialog($dialog, resolve:CreateLocationDialogOptions) {
    return $dialog.dialog({
      resolve: resolve,
      templateUrl: 'app/fabric/html/newLocation.html',
      controller: ["$scope", "dialog", "jolokia", "selectedContainers", "callbacks", ($scope, dialog, jolokia, selectedContainers, callbacks) => {
        $scope.newLocationName = "";
        $scope.close = (result) => {
          dialog.close();
          if (result) {
            selectedContainers.each((container) => {
              Fabric.setContainerProperty(jolokia, container.id, 'location', $scope.newLocationName, callbacks.successs, callbacks.error);
            });
          }
        } 
      }]
    });
  }

  export function getVersionCreateDialog($dialog) {
    var key = 'createVersion';
    if (!(key in dialogConfigs)) {
      dialogConfigs[key] = $dialog.dialog({
        templateUrl: 'app/fabric/html/createVersionDialog.html',
        controller: ["$scope", "dialog", "jolokia", "$location", ($scope, dialog, jolokia, $location) => {
          $scope.name = '';
          $scope.close = (result) => {
            dialog.close();
            if (result) {
              Fabric.doCreateVersion($scope, jolokia, $location, $scope.name);
            }
          }
        }]
      });
    }
    return dialogConfigs[key];
  }

  export function getVersionDeleteDialog($dialog) {
    var key = 'deleteVersion';
    if (!(key in dialogConfigs)) {
      dialogConfigs[key] = $dialog.dialog({
        templateUrl: 'app/fabric/html/selectVersionDialog.html',
        controller: ["$scope", "dialog", "jolokia", "$location", "$rootScope", ($scope, dialog, jolokia, $location, $rootScope) => {
          $scope.excludes = [];
          $scope.$watch('selectedVersion.id', (newValue, oldValue) => {
            if (newValue) {
              if ($scope.excludes.find((v) => {
                return v === newValue;
              })) {
                $scope.warning = "This version is in use and cannot be deleted."
                $scope.invalid = true;
              } else {
    	        if ($scope.selectedVersion.defaultVersion === true) {
    		  $scope.warning = "This version is set default and cannot be deleted."
    		  $scope.invalid = true;
    	        } else {
    		  $scope.warning = "This operation cannot be undone!";
    		  $scope.invalid = false;
    	        }
              }
            }
          });
          getVersionsInUse(jolokia, (used:string[]) => {
            $scope.excludes = used;
            Core.$apply($scope);
          });
          $scope.invalid = false;
          $scope.title = "Delete Version";
          $scope.text = "Select the version to delete:";
          $scope.warning = "This operation cannot be undone!";
          $scope.action = "Delete";
          $scope.cancel = "Cancel";
          $scope.close = (result) => {
            dialog.close();
            if (result) {
              var selectedVersion = $scope.selectedVersion.id;
              deleteVersion(jolokia, selectedVersion, () => {
                $rootScope.$broadcast('wikiBranchesUpdated');
                getDefaultVersionIdAsync(jolokia, (versionId) => {
                  viewVersion(versionId, $location, $scope);
                  Core.$apply($scope);
                });
              }, (response) => {
                log.debug("Failed to delete version ", selectedVersion," due to ", response.error);
                log.debug("Stack trace: ", response.stacktrace);
                Core.$apply($scope);
              });
            }
          }
        }]
      })
    }
    return dialogConfigs[key];
  }

  export function getChangeDefaultVersionDialog($dialog) {
    var key = 'changeDefault';
    if (!(key in dialogConfigs)) {
      dialogConfigs[key] = $dialog.dialog({
        templateUrl: 'app/fabric/html/selectVersionDialog.html',
        controller: ["$scope", "dialog", "jolokia", "$location", ($scope, dialog, jolokia, $location) => {
          $scope.title = "Change Default Version";
          $scope.text = "Change the default version to:";
          //$scope.warning = "This operation cannot be undone!";
          $scope.action = "Change";
          $scope.cancel = "Cancel";
          $scope.close = (result) => {
            dialog.close();
            if (result) {
              var newDefault = $scope.selectedVersion.id;
              setDefaultVersion(jolokia, newDefault, () => {
                Core.notification('success', "Set default version to " + newDefault);
                Core.$apply($scope);
              });
            }
          }
        }]
      })
    }
    return dialogConfigs[key];
  }

  export function getVersionPatchDialog($dialog) {
    var key = 'patchVersion';
    if (!(key in dialogConfigs)) {
      dialogConfigs[key] = $dialog.dialog({
        templateUrl: 'app/fabric/html/selectVersionDialog.html',
        controller: ["$scope", "dialog", "jolokia", "$location", ($scope, dialog, jolokia, $location) => {
          $scope.title = "Patch Version";
          $scope.text = "Select the version to patch:";
          //$scope.warning = "This operation cannot be undone!";
          $scope.action = "Continue";
          $scope.cancel = "Cancel";
          $scope.close = (result) => {
            dialog.close();
            if (result) {
              $location.url('/fabric/patching').search({versionId: $scope.selectedVersion.id});
              Core.$apply($scope);
            }
          }
        }]
      })
    }
    return dialogConfigs[key];
  }

  export function addWikiBranchMenuExtensions(wikiBranchMenu, $dialog, workspace) {
    wikiBranchMenu.addExtension({
      title: "Create Version",
      valid: () => {
        return Fabric.isFMCContainer(workspace);
      },
      action: () => {
        getVersionCreateDialog($dialog).open();
      },
      objectName: Fabric.managerMBean,
      methodName: 'createVersion'
    });

    wikiBranchMenu.addExtension({
      title: "Delete Version",
      valid: () => {
        return Fabric.isFMCContainer(workspace);
      },
      action: () => {
        getVersionDeleteDialog($dialog).open();
      },
      objectName: Fabric.managerMBean,
      methodName: 'deleteVersion'
    });

    wikiBranchMenu.addExtension({
      title: "Change Default",
      valid: () => {
        return Fabric.isFMCContainer(workspace);
      },
      action: () => {
        getChangeDefaultVersionDialog($dialog).open();
      },
      objectName: Fabric.managerMBean,
      methodName: 'setDefaultVersion'
    });

    wikiBranchMenu.addExtension({
      title: "Patch Version",
      valid: () => {
        return Fabric.isFMCContainer(workspace) && !Fabric.hasOpenShiftFabric(workspace);
      },
      action: () => {
        getVersionPatchDialog($dialog).open();
      },
      objectName: Fabric.managerMBean,
      methodName: 'applyPatches',
      argumentTypes: 'java.util.List,java.lang.String,java.lang.String,java.lang.String,java.lang.String'
    });
  }

}
