/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>

module Kubernetes {

  export var ReplicationControllers = controller("ReplicationControllers", ["$scope", "KubernetesReplicationControllers", ($scope, KubernetesReplicationControllers:ng.IPromise<ng.resource.IResourceClass>) => {

    $scope.replicationControllers = [];
    $scope.fetched = false;
    $scope.tableConfig = {
      data: 'replicationControllers',
      showSelectionCheckbox: false,
      enableRowClickSelection: false,
      multiSelect: false,
      columnDefs: [
        { field: 'id', displayName: 'ID' },
      ]
    };

    KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
      $scope.fetch = PollHelpers.setupPolling($scope, (next: () => void) => {
        KubernetesReplicationControllers.query((response) => {
          log.debug("got back response: ", response);
          $scope.fetched = true;
          $scope.replicationControllers = response['items'];
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
