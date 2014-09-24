/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
module Kubernetes {

  export var Services = controller("Services", ["$scope", "KubernetesServices", "$templateCache", ($scope, KubernetesServices:ng.IPromise<ng.resource.IResourceClass>, $templateCache:ng.ITemplateCacheService) => {

    $scope.services = [];
    $scope.fetched = false;
    $scope.tableConfig = {
      data: 'services',
      showSelectionCheckbox: false,
      enableRowClickSelection: false,
      multiSelect: false,
      columnDefs: [
        { field: 'id', displayName: 'ID' },
        { field: 'selector', displayName: 'Selector', cellTemplate: $templateCache.get("selectorTemplate.html") },
        { field: 'containerPort', displayName: 'Container Port' },
        { field: 'port', displayName: 'Port' },
        { field: 'protocol', displayName: 'Protocol' },
        { field: 'labels', displayName: 'Labels', cellTemplate: $templateCache.get("labelTemplate.html") }
      ]
    };

    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      $scope.fetch = PollHelpers.setupPolling($scope, (next: () => void) => {
        KubernetesServices.query((response) => {
          $scope.fetched = true;
          $scope.services = response['items'].sortBy((item) => { return item.id; });
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
