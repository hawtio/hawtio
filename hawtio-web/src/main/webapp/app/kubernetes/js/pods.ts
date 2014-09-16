/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  
  export var Pods = controller("Pods", ["$scope", "KubernetesPods", ($scope, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>) => {

    $scope.pods = []
    $scope.podsConfig = {
      data: 'pods',
      showSelectionCheckbox: false,
      enableRowClickSelection: false,
      multiSelect: false,
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

    KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
      KubernetesPods.query((response) => {
        $scope.pods = response['items'];
      });
    });

    $scope.$watch('pods', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("pods: ", newValue);
      }
    });

  }]);
}
