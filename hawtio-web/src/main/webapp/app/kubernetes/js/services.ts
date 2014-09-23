/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
module Kubernetes {

  export var Services = controller("Services", ["$scope", "KubernetesServices", ($scope, KubernetesServices:ng.IPromise<ng.resource.IResourceClass>) => {

    $scope.services = [];
    $scope.fetched = false;
    $scope.tableConfig = {
      data: 'services',
      showSelectionCheckbox: false,
      enableRowClickSelection: false,
      multiSelect: false,
      columnDefs: [
        { field: 'id', displayName: 'ID' },
        { field: 'labels', displayName: 'Labels' },
        { field: 'selector', displayName: 'Selector' },
        { field: 'port', displayName: 'Port' }
      ]
    };

    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      $scope.fetch = PollHelpers.setupPolling($scope, (next: () => void) => {
        KubernetesServices.query((response) => {
          $scope.fetched = true;
          $scope.services = response['items'];
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
