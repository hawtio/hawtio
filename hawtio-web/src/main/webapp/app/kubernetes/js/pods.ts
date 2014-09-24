/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../fabric/js/fabricHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module Kubernetes {

  interface KubePod {
    id:string;
  }

  // controller for the status icon cell
  export var PodStatus = controller("PodStatus", ["$scope", ($scope) => {
    $scope.statusMapping = {
      'Running': 'icon-play-circle green',
      'Waiting': 'icon-download',
      'Terminated': 'icon-off yellow'
    };
  }]);

  // controller that deals with the labels per pod
  export var Labels = controller("Labels", ["$scope", "workspace", "jolokia", "$location", ($scope, workspace, jolokia, $location) => {
    $scope.labels = {};
    $scope.$watch('entity', (newValue, oldValue) => {
      if (newValue) {
        log.debug("labels: ", newValue);
        // massage the labels a bit
        angular.forEach($scope.entity.labels, (value, key) => {
          if (key === 'fabric8') {
            // TODO not sure what this is for, the container type?
            return;
          }
          $scope.labels[key] = {
            title: value
          };
        });
      }
    });
    $scope.handleClick = (entity, labelType:string, value) => {
      log.debug("handleClick, entity: ", entity, " labelType: ", labelType, " value: ", value);
      switch (labelType) {
        case 'container':
          if (entity.labels.container) {
            Fabric.gotoContainer(entity.labels.container);
          }
          return;
        case 'profile':
          if (entity.labels.version && entity.labels.profile) {
            Fabric.gotoProfile(workspace, jolokia, workspace.localStorage, $location, entity.labels.version, entity.labels.profile);
          }
          return;
        default:
          return;
      }
    }
    var labelColors = {
      'profile': 'background-green mouse-pointer',
      'version': 'background-blue',
      'name': 'background-light-grey',
      'container': 'background-light-green mouse-pointer'
    };
    $scope.labelClass = (labelType:string) => {
      if (!(labelType in labelColors)) {
        return '';
      }
      else return labelColors[labelType];
    }
  }]);
 
  // main controller for the page
  export var Pods = controller("Pods", ["$scope", "KubernetesPods", "$dialog", "$templateCache", "jolokia", "$timeout", ($scope, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, $dialog, $templateCache, jolokia:Jolokia.IJolokia, $timeout) => {

    $scope.pods = []
    $scope.fetched = false;

    $scope.podsConfig = {
      data: 'pods',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      columnDefs: [
        {
          field: 'id',
          displayName: 'ID',
          defaultSort: true
        },
        {
          field: 'currentState.status',
          displayName: 'Status',
          cellTemplate: $templateCache.get("statusTemplate.html")
        },
        {
          field: 'containerImages',
          displayName: 'Images',
          cellTemplate: $templateCache.get("imageTemplate.html")
        },
        {
          field: 'currentState.host',
          displayName: 'Host'
        },
        { 
          field: 'currentState.podIP',
          displayName: 'Pod IP'
        },
        {
          field: 'labels',
          displayName: 'Labels',
          cellTemplate: $templateCache.get("labelTemplate.html")
        }
      ]
    };

    KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
      $scope.deletePrompt = (selected:Array<KubePod>) => {
        UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
          collection: selected,
          index: 'id',
          onClose: (result:boolean) => {
            if (result) {
              function deleteSelected(selected:Array<KubePod>, next:KubePod) {
                if (!next) {
                  if (!jolokia.isRunning()) {
                    $scope.fetch();
                  }
                } else {
                  log.debug("deleting: ", next.id);
                  KubernetesPods.delete({
                    id: next.id
                  }, undefined, () => {
                    log.debug("deleted: ", next.id);
                    deleteSelected(selected, selected.shift());
                  }, (error) => {
                    log.debug("Error deleting: ", error);
                    deleteSelected(selected, selected.shift());
                  });
                }
              }
              deleteSelected(selected, selected.pop());
            }
          },
          title: 'Delete pods?',
          action: 'The following pods will be deleted:',
          okText: 'Delete',
          okClass: 'btn-danger',
          custom: "This operation is permanent once completed!",
          customClass: "alert alert-warning"
        }).open();
      };
      // setup polling
      $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
        KubernetesPods.query((response) => {
          $scope.fetched = true;
          $scope.pods = response['items'].sortBy((pod:KubePod) => { return pod.id });
            //log.debug("Pods: ", $scope.pods);
          next();
        });
      });
      // kick off polling
      $scope.fetch();
    });
  }]);
}
