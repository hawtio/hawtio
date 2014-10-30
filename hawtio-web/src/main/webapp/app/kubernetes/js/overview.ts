/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
module Kubernetes {

  var OverviewDirective = _module.directive("kubernetesOverview", ["$templateCache", "$compile", "$interpolate", ($templateCache:ng.ITemplateCacheService, $compile:ng.ICompileService, $interpolate:ng.IInterpolateService) => {
    return {
      restrict: 'E',
      replace: true,
      link: (scope, element, attr) => {
        function interpolate(template, config) {
          return $interpolate(template)(config);
        }
        function createElement(template, thingName, thing) {
          var config = {};
          config[thingName] = thing;
          return interpolate(template, config);
        }
        function createElements(template, thingName, things) {
          return things.map((thing) => {
            return createElement(template, thingName, thing);
          });
        }
        function appendNewElements(parentEl, template, thingName, things) {
          things.forEach((thing) => {
            var existing = parentEl.find("#" + thing['id']);
            if (!existing.length) {
              parentEl.append($compile(createElement(template, thingName, thing))(scope));
            }
          });
        }
        function firstDraw() {
          log.debug("First draw");
          var services = scope.services;
          var replicationControllers = scope.replicationControllers;
          var pods = scope.pods;
          var parentEl = angular.element($templateCache.get("overviewTemplate.html"));
          parentEl.append(createElements($templateCache.get("serviceTemplate.html"), 'service', services));
          parentEl.append(createElements($templateCache.get("replicationControllerTemplate.html"), 'replicationController', replicationControllers));
          parentEl.append(createElements($templateCache.get("podTemplate.html"), 'pod', pods));
          element.append($compile(parentEl)(scope));
        }
        function hasId(collection, id) {
          return collection.any((obj) => { return obj['id'] === id; });
        }
        function update() {
          scope.$emit('jsplumbDoWhileSuspended', () => {
            log.debug("Update");
            var services = scope.services;
            var replicationControllers = scope.replicationControllers;
            var pods = scope.pods;
            var parentEl = element.find('[hawtio-jsplumb]');
            var children = parentEl.find('.jsplumb-node');
            children.each((index, c) => {
              var child = angular.element(c);
              var id = child.attr('id');
              if (Core.isBlank(id)) {
                return;
              }
              var type = child.attr('data-type');
              function byId(thing) { return thing['id'] === id; }
              switch (type) {
                case 'service':
                  if (hasId(services, id)) {
                    var service = services.find(byId);
                    child.attr('connect-to', service.connectTo);
                    return;
                  }
                  break;
                case 'pod':
                  if (hasId(pods, id)) {
                    return;
                  }
                  break;
                case 'replicationController':
                  if (hasId(replicationControllers, id)) {
                    var replicationController = replicationControllers.find(byId);
                    child.attr('connect-to', replicationControllers.connectTo);
                    return;
                  }
                  break;
                default: 
                  log.debug("Ignoring element with unknown type");
                  return;
              }
              log.debug("Removing: ", id);
              child.remove();
            });
            appendNewElements(parentEl, $templateCache.get("serviceTemplate.html"), "service", services); 
            appendNewElements(parentEl, $templateCache.get("podTemplate.html"), "pod", pods); 
            appendNewElements(parentEl, $templateCache.get("replicationControllerTemplate.html"), "replicationController", replicationControllers); 
          });
        }
        scope.$watch('count', (count) => {
          if (count > 0) {
            if (element.children().length === 0) {
              firstDraw();
            } else {
              update();
            }
          }
        });
      }
    };
  }]);

  var scopeName = "OverviewController";

  var OverviewController = controller(scopeName, ["$scope", "KubernetesServices", "KubernetesPods", "KubernetesReplicationControllers", ($scope, KubernetesServices, KubernetesPods, KubernetesReplicationControllers) => {
    $scope.name = scopeName;
    $scope.services = null;
    $scope.replicationControllers = null;
    $scope.pods = null;

    $scope.count = 0;

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
        $scope.count = $scope.count + 1;
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
