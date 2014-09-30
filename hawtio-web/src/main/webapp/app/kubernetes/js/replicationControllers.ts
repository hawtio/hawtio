/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module Kubernetes {

  export var ReplicationControllers = controller("ReplicationControllers",
    ["$scope", "KubernetesReplicationControllers", "$templateCache", "$location", "jolokia",
      ($scope, KubernetesReplicationControllers:ng.IPromise<ng.resource.IResourceClass>, $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, jolokia:Jolokia.IJolokia) => {

    $scope.replicationControllers = [];
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

    Kubernetes.initShared($scope);

    $scope.tableConfig = {
      data: 'replicationControllers',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: ''
      },
      columnDefs: [
        { field: 'id', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
        { field: 'currentState.replicas', displayName: 'Current Replicas' },
        { field: 'desiredState.replicas', displayName: 'Desired Replicas' },
        { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") }
      ]
    };

    $scope.$on('kubeSelectedId', ($event, id) => {
      Kubernetes.setJson($scope, id, $scope.replicationControllers);
    });

    KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
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
                  KubernetesReplicationControllers.delete({
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
          title: 'Delete replication controllers?',
          action: 'The following replication controllers will be deleted:',
          okText: 'Delete',
          okClass: 'btn-danger',
          custom: "This operation is permanent once completed!",
          customClass: "alert alert-warning"
        }).open();
      };

      $scope.fetch = PollHelpers.setupPolling($scope, (next: () => void) => {
        KubernetesReplicationControllers.query((response) => {
          log.debug("got back response: ", response);
          $scope.fetched = true;
          $scope.replicationControllers = (response['items'] || []).sortBy((item) => { return item.id; });
          angular.forEach($scope.replicationControllers, entity => {
            entity.$labelsText = Kubernetes.labelsToString(entity.labels);
          });
          Kubernetes.setJson($scope, $scope.id, $scope.replicationControllers);
          next();
        });
      });
      $scope.fetch();
    });

    $scope.$watch('replicationControllers', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("replicationControllers: ", newValue);
      }
    });
  }]);
}
