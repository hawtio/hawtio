/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module Kubernetes {

  interface KubePod {
    id:string;
  }
  
  export var Pods = controller("Pods", ["$scope", "KubernetesPods", "$dialog", ($scope, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, $dialog) => {

    $scope.pods = []
    $scope.fetched = false;

    $scope.podsConfig = {
      data: 'pods',
      showSelectionCheckbox: false,
      enableRowClickSelection: true,
      multiSelect: true,
      selectedItems: [],
      columnDefs: [
        {
          field: 'id',
          displayName: 'ID'
        },
        {
          field: 'currentState.status',
          displayName: 'Image Status'
        },
        {
          field: 'currentState.host',
          displayName: 'Host'
        },
        {
          field: 'labels',
          displayName: 'Labels'
        }
      ]
    };

    function fetch(KubernetesPods:ng.resource.IResourceClass) {
      // Fetch the list of pods
      KubernetesPods.query((response) => {
        $scope.fetched = true;
        $scope.pods = response['items'];
      });
    }

    KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {

      $scope.deletePrompt = (selected:Array<KubePod>) => {
        UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
          collection: selected,
          index: 'id',
          onClose: (result:boolean) => {
            if (result) {
              function deleteSelected(selected:Array<KubePod>, next:KubePod) {
                if (!next) {
                  $scope.fetched = false;
                  // update the table
                  fetch(KubernetesPods);
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

      // initial fetch
      fetch(KubernetesPods);
    });

  }]);
}
