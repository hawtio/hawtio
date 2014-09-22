/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {
  
  export var Pods = controller("Pods", ["$scope", "KubernetesPods", ($scope, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>) => {

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

    KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
      // Define all our functions that need KubernetesPods
      $scope.deletePrompt = (selected) => {
        log.debug("delete: ", selected);
      };
      // Fetch the list of pods
      KubernetesPods.query((response) => {
        $scope.fetched = true;
        $scope.pods = response['items'];
      });
    });

  }]);
}
