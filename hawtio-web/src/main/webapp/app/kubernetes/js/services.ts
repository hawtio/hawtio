/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
module Kubernetes {

  export var Services = controller("Services", ["$scope", "KubernetesServices", "$templateCache", "$location", ($scope, KubernetesServices:ng.IPromise<ng.resource.IResourceClass>, $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService) => {

    $scope.services = [];
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);
    $scope.tableConfig = {
      data: 'services',
      showSelectionCheckbox: false,
      enableRowClickSelection: false,
      multiSelect: false,
      columnDefs: [
        { field: 'id', displayName: 'ID', cellTemplate: $templateCache.get("idTemplate.html") },
        { field: 'selector', displayName: 'Selector', cellTemplate: $templateCache.get("selectorTemplate.html") },
        { field: 'containerPort', displayName: 'Container Port' },
        { field: 'port', displayName: 'Port' },
        { field: 'protocol', displayName: 'Protocol' },
        { field: 'labels', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") }
      ]
    };

    $scope.$on('kubeSelectedId', ($event, id) => {
      Kubernetes.setJson($scope, id, $scope.services);
    });

    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      $scope.fetch = PollHelpers.setupPolling($scope, (next: () => void) => {
        KubernetesServices.query((response) => {
          $scope.fetched = true;
          $scope.services = (response['items'] || []).sortBy((item) => { return item.id; });
          Kubernetes.setJson($scope, $scope.id, $scope.services);
          next();
        });
      });
      $scope.fetch();
    });

    $scope.$watch('services', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("services: ", newValue);
      }
    });



  }]);
}
