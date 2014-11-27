/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module Kubernetes {

  export var DesiredReplicas = controller("DesiredReplicas", ["$scope", ($scope) => {
    var watch:any = null;
    var originalValue:number = null;
    $scope.$watch('row.entity', (entity) => {
      // log.debug("entity updated: ", entity);
      if (watch && angular.isFunction(watch)) {
        originalValue = null;
        watch();
      }
      watch = $scope.$watch('row.entity.desiredState.replicas', (replicas) => {
        if (originalValue === null && replicas !== undefined) {
          originalValue = replicas;
        }
        if (replicas < 0) {
          $scope.row.entity.desiredState.replicas = 0;
        }
        if (replicas !== originalValue) {
          $scope.$emit('kubernetes.dirtyController', $scope.row.entity);
        } else {
          $scope.$emit('kubernetes.cleanController', $scope.row.entity);
        }
        Core.$apply($scope);
        // log.debug("Replicas: ", replicas, " original value: ", originalValue);
      });
    });

    $scope.$on('kubernetes.resetReplicas', ($event) => {
      $scope.row.entity.desiredState.replicas = originalValue;
    });
  }]);

  export var ReplicationControllers = controller("ReplicationControllers",
    ["$scope", "KubernetesReplicationControllers", "$templateCache", "$location", "jolokia",
      ($scope, KubernetesReplicationControllers:ng.IPromise<ng.resource.IResourceClass>, $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, jolokia:Jolokia.IJolokia) => {

    $scope.replicationControllers = [];
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

    $scope.detailConfig = {
      properties: {
        '^\\/labels$': {
          template: $templateCache.get('labelTemplate.html')
        }
      }
    }

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
        { field: 'id', displayName: '', cellTemplate: $templateCache.get("iconCellTemplate.html") },
        { field: 'id', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
        { field: 'currentState.replicas', displayName: 'Current Replicas', cellTemplate: $templateCache.get("currentReplicasTemplate.html") },
        { field: 'desiredState.replicas', displayName: 'Desired Replicas', cellTemplate:$templateCache.get("desiredReplicas.html") },
        { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") }
      ]
    };

    Kubernetes.initShared($scope, $location);


    $scope.$on('kubernetes.dirtyController', ($event, replicationController) => {
      replicationController.$dirty = true;
      //log.debug("Replication controller is dirty: ", replicationController, " all replication controllers: ", $scope.replicationControllers);
    });

    $scope.$on('kubernetes.cleanController', ($event, replicationController) => {
      replicationController.$dirty = false;
    });

    $scope.anyDirty = () => {
      return $scope.replicationControllers.any((controller) => { return controller.$dirty; });
    };

    $scope.undo = () => {
      $scope.$broadcast('kubernetes.resetReplicas');
    };

    /*$scope.$watch('anyDirty()', (dirty) => {
      log.debug("Dirty controllers: ", dirty);
    });*/

    $scope.$on('kubeSelectedId', ($event, id) => {
      Kubernetes.setJson($scope, id, $scope.replicationControllers);
    });

    $scope.$on('$routeUpdate', ($event) => {
      Kubernetes.setJson($scope, $location.search()['_id'], $scope.pods);
    });

    KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
      $scope.save = () => {
        var dirtyControllers = $scope.replicationControllers.filter((controller) => { return controller.$dirty });
        if (dirtyControllers.length) {
          dirtyControllers.forEach((replicationController) => {
            var apiVersion = replicationController["apiVersion"];
            if (!apiVersion) {
              replicationController["apiVersion"] = Kubernetes.defaultApiVersion;
            }
            KubernetesReplicationControllers.save(undefined, replicationController, () => {
              replicationController.$dirty = false;
              log.debug("Updated ", replicationController.id);
            }, (error) => {
              replicationController.$dirty = false;
              log.debug("Failed to update ", replicationController.id, " error: ", error);
            });

          });
        }
      };

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
          //log.debug("got back response: ", response);
          $scope.fetched = true;
          if ($scope.anyDirty()) {
            log.debug("Table has been changed, not updating local view");
            next();
            return;
          }
          $scope.replicationControllers = (response['items'] || []).sortBy((item) => { return item.id; });
          angular.forEach($scope.replicationControllers, entity => {
            entity.$labelsText = Kubernetes.labelsToString(entity.labels);
            var desiredState = entity.desiredState || {};
            var replicaSelector = desiredState.replicaSelector;
            if (replicaSelector) {
              entity.podsLink = "#/kubernetes/pods?q=" + Kubernetes.labelsToString(replicaSelector, " ");
            }
          });
          Kubernetes.setJson($scope, $scope.id, $scope.replicationControllers);
          next();
        });
      });
      $scope.fetch();
    });

    /*$scope.$watch('replicationControllers', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("replicationControllers: ", newValue);
      }
    });*/
  }]);
}
