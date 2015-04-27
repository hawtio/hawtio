/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module Kubernetes {

  export var Services = controller("Services",
    ["$scope", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "jolokia",
      ($scope, KubernetesServices:ng.IPromise<ng.resource.IResourceClass>, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, jolokia:Jolokia.IJolokia) => {

    $scope.namespace = $routeParams.namespace;
    $scope.services = [];
    $scope.allServices = [];
    $scope.kubernetes = KubernetesState;
    var pods = [];
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

    $scope.tableConfig = {
      data: 'services',
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
        { field: '$podsLink', displayName: 'Pods', cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html") },
        { field: 'selector', displayName: 'Selector', cellTemplate: $templateCache.get("selectorTemplate.html") },
        { field: 'portalIP', displayName: 'Address', cellTemplate: $templateCache.get("portalAddress.html") },
        { field: 'labelsText', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") },
        { field: 'namespace', displayName: 'Namespace' }
      ]
    };

    Kubernetes.initShared($scope, $location);

    $scope.$on('kubeSelectedId', ($event, id) => {
      Kubernetes.setJson($scope, id, $scope.services);
    });

    $scope.$on('$routeUpdate', ($event) => {
      Kubernetes.setJson($scope, $location.search()['_id'], $scope.pods);
    });

    function updatePodCounts() {
      // lets iterate through the services and update the counts for the pods
      angular.forEach($scope.services, (service) => {
        var selector = service.selector;
        service.$podCounters = selector ? createPodCounters(selector, pods) : null;
      });

      updateNamespaces($scope.kubernetes, pods, [], $scope.allServices);
    }

    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
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
                    KubernetesServices.delete({
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
            title: 'Delete services?',
            action: 'The following services will be deleted:',
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

          KubernetesServices.query((response) => {
            $scope.fetched = true;
            $scope.allServices = (response['items'] || []).sortBy((item) => {
              return item.id;
            });
            $scope.services = $scope.allServices.filter((item) => {
              return !$scope.kubernetes.selectedNamespace || $scope.kubernetes.selectedNamespace === item.namespace
            });

            Kubernetes.setJson($scope, $scope.id, $scope.services);
            angular.forEach($scope.services, entity => {
              entity.$labelsText = Kubernetes.labelsToString(entity.labels);
            });
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
  }]);
}
