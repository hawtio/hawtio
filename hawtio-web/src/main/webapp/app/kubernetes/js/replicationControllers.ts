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
    ["$scope", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia",
      ($scope, KubernetesReplicationControllers:ng.IPromise<ng.resource.IResourceClass>, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, jolokia:Jolokia.IJolokia) => {

    $scope.namespace = $routeParams.namespace;
    $scope.kubernetes = KubernetesState;
    $scope.replicationControllers = [];
    var pods = [];
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

    $scope.detailConfig = {
      properties: {
        '^\\/labels$': {
          template: $templateCache.get('labelTemplate.html')
        }
      }
    };

    $scope.tableConfig = {
      data: 'replicationControllers',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        { field: 'icon', displayName: '', cellTemplate: $templateCache.get("iconCellTemplate.html") },
        { field: 'id', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
        { field: 'namespace', displayName: 'Namespace' },
        { field: 'currentState.replicas', displayName: 'Pods', cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html") },
        { field: 'desiredState.replicas', displayName: 'Replicas', cellTemplate:$templateCache.get("desiredReplicas.html") },
        { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") }
      ]
    };

    Kubernetes.initShared($scope, $location);


    function updatePodCounts() {
      // lets iterate through the services and update the counts for the pods
      angular.forEach($scope.replicationControllers, (replicationController) => {
        var selector = (replicationController.desiredState || {}).replicaSelector;
        replicationController.$podCounters = selector ? createPodCounters(selector, pods) : null;
      });

      updateNamespaces($scope.kubernetes, pods, $scope.replicationControllers);
    }

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
      KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
        $scope.save = () => {
          var dirtyControllers = $scope.replicationControllers.filter((controller) => {
            return controller.$dirty
          });
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

        $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
          var ready = 0;
          var numServices = 2;

          function maybeNext(count) {
            ready = count;
            // log.debug("Completed: ", ready);
            if (ready >= numServices) {
              // log.debug("Fetching another round");
              maybeInit();
              next();
            }
          }

          KubernetesReplicationControllers.query((response) => {
            //log.debug("got back response: ", response);
            $scope.fetched = true;
            if ($scope.anyDirty()) {
              log.debug("Table has been changed, not updating local view");
              next();
              return;
            }
            $scope.replicationControllers = (response['items'] || []).sortBy((item) => {
              return item.id;
            }).filter((item) => {
              return !$scope.namespace || $scope.namespace === item.namespace
            });
            angular.forEach($scope.replicationControllers, entity => {
              entity.$labelsText = Kubernetes.labelsToString(entity.labels);
              var desiredState = entity.desiredState || {};
              var replicaSelector = desiredState.replicaSelector;
              if (replicaSelector) {
                entity.podsLink = Core.url("/kubernetes/pods?q=" +
                encodeURIComponent(Kubernetes.labelsToString(replicaSelector, " ")));
              }
            });
            Kubernetes.setJson($scope, $scope.id, $scope.replicationControllers);
            updatePodCounts();
            maybeNext(ready + 1);
          });

          KubernetesPods.query((response) => {
            ArrayHelpers.sync(pods, (response['items'] || []).filter((pod:KubePod) => {
              return pod.id && (!$scope.namespace || $scope.namespace === pod.namespace)
            }));
            updatePodCounts();
            maybeNext(ready + 1);
          });
        });
        $scope.fetch();
      });
    });

    function maybeInit() {
    }

    /*$scope.$watch('replicationControllers', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("replicationControllers: ", newValue);
      }
    });*/
  }]);
}
