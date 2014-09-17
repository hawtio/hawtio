/// <reference path="kubernetesPlugin.ts"/>

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
        {
          field: 'id',
          displayName: 'ID'
        }
      ]
    };

    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      KubernetesServices.query((response) => {
        log.debug("got back response: ", response);
        $scope.fetched = true;
        $scope.services = response['items'];
      });
    });

    $scope.$watch('services', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("services: ", newValue);
      }
    });



  }]);
}
