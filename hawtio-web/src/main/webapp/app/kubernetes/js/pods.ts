/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../helpers/js/controllerHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module Kubernetes {

  // main controller for the page
  export var Pods = controller("Pods", ["$scope", "KubernetesPods", "$dialog", "$templateCache", "jolokia", "$location", ($scope, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, $dialog, $templateCache, jolokia:Jolokia.IJolokia, $location:ng.ILocationService) => {

    $scope.pods = []
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

    $scope.$on('kubeSelectedId', ($event, id) => {
      Kubernetes.setJson($scope, id, $scope.pods);
    });

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
          defaultSort: true,
          cellTemplate: $templateCache.get("idTemplate.html")
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
      $scope.deletePrompt = (selected) => {
        if (angular.isString(selected)) {
          selected = [{
            id: selected
          }];
        }
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
              deleteSelected(selected, selected.shift());
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
          Kubernetes.setJson($scope, $scope.id, $scope.pods);
          //log.debug("Pods: ", $scope.pods);
          next();
        });
      });
      // kick off polling
      $scope.fetch();
    });
  }]);
}
