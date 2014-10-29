/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
module Kubernetes {

  var OverviewController = controller("OverviewController", ["$scope", "KubernetesServices", "KubernetesPods", "KubernetesReplicationControllers", ($scope, KubernetesServices, KubernetesPods, KubernetesReplicationControllers) => {

    $scope.services = null;
    $scope.replicationControllers = null;
    $scope.pods = null;

    var services = null;
    var replicationControllers = null;
    var pods = null;

    $scope.connectorStyle = [ "Bezier" ];

    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
        KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
          var lastServiceResponse, lastReplicationControllerResponse, lastPodsResponse = '';
          var byId = (thing) => { return thing.id; };
          $scope.fetch = PollHelpers.setupPolling($scope, (next: () => void) => {
            var ready = 0;
            var numServices = 3;
            function maybeNext(count) {
              ready = count;
              // log.debug("Completed: ", ready);
              if (ready >= numServices) {
                // log.debug("Fetching another round");
                next();
              }
            }
            KubernetesServices.query((response) => {
              if (response) {
                var items = response.items.sortBy(byId);
                var json = angular.toJson(items);
                if (lastServiceResponse !== json) {
                  lastServiceResponse = json;
                  services = items;
                  maybeInit();
                }
              }
              maybeNext(ready + 1);
            });
            KubernetesReplicationControllers.query((response) => {
              if (response) {
                var items = response.items.sortBy(byId);
                var json = angular.toJson(items);
                if (lastReplicationControllerResponse !== json) {
                  lastReplicationControllerResponse = json;
                  replicationControllers = items;
                  maybeInit();
                }
              }
              maybeNext(ready + 1);
            });
            KubernetesPods.query((response) => {
              if (response) {
                var items = response.items.sortBy(byId);
                var json = angular.toJson(items);
                if (lastPodsResponse !== json) {
                  lastPodsResponse = json;
                  pods = items;
                  maybeInit();
                }
              }
              maybeNext(ready + 1);
            });
          });
          $scope.fetch();
        });
      });
    });

    function getPodIdsForLabel(label:string, value:string) {
      var matches = pods.filter((pod) => { return label in pod.labels; });
      matches = matches.filter((pod) => { return pod.labels[label] === value; });
      return matches.map((pod) => { return pod.id; });
    }

    function maybeInit() {
      if (services && replicationControllers && pods) {
        services.forEach((service) => {
          service.podIds = [];
          angular.forEach(service.selector, (value, key) => {
            var ids = getPodIdsForLabel(key, value);
            service.podIds = service.podIds.union(ids);
          });
          service.connectTo = service.podIds.join(',');
        });
        replicationControllers.forEach((replicationController) => {
          replicationController.podIds = getPodIdsForLabel('replicationController', replicationController.id);
          replicationController.connectTo = replicationController.podIds.join(',');
        });
        $scope.pods = pods;
        $scope.services = services;
        $scope.replicationControllers = replicationControllers;
      }
    }

    $scope.$watchCollection('services', (services) => {
      log.debug("got services: ", services);
    });

    $scope.$watchCollection('replicationControllers', (replicationControllers) => {
      log.debug("got replicationControllers: ", replicationControllers);
    });

    $scope.$watchCollection('pods', (pods) => {
      log.debug("got pods: ", pods);
      if (pods) {
        var hosts = {};
        pods.forEach((pod) => {
          var host = pod.currentState.host;
          if (!(host in hosts)) {
            hosts[host] = [];
          }
          hosts[host].push(pod);
        });
        $scope.hosts = hosts;
      }
    });

    $scope.$watch('hosts', (hosts) => {
      log.debug("hosts: ", hosts);
    });

  }]);

}
