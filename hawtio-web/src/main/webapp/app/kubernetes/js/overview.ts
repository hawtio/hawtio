/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
module Kubernetes {

  var OverviewDirective = _module.directive("kubernetesOverview", ["$templateCache", "$compile", "$interpolate", "$timeout", ($templateCache:ng.ITemplateCacheService, $compile:ng.ICompileService, $interpolate:ng.IInterpolateService, $timeout:ng.ITimeoutService) => {
    return {
      restrict: 'E',
      replace: true,
      link: (scope, element, attr) => {
        element.css({visibility: 'hidden'});
        scope.getEntity = (type:string, id:string) => {
          switch (type) {
            case 'host':
              return scope.hostsById[id];
            case 'pod':
              return scope.podsById[id];
            case 'replicationController':
              return scope.replicationControllersById[id];
            case 'service':
              return scope.servicesById[id];
            default:
              return undefined;

          }
        }
        scope.customizeDefaultOptions = (options) => {
          options.Endpoint = ['Blank', {}];
        };
        /*
        scope.customizeEndpointOptions = (jsPlumb, node, options) => {
          var type = node.el.attr('data-type');
          // log.debug("endpoint type: ", type);
          switch (type) {
            case 'pod':
              break;
            case 'service':
              break;
            case 'replicationController':
              break;
          }
        };
        */
        scope.customizeConnectionOptions = (jsPlumb, edge, params, options) => {
          var type = edge.source.el.attr('data-type');
          options.connector = [ "Bezier", { curviness: 50, stub: 25, alwaysRespectStubs: true } ];
          switch (type) {
            case 'pod':
              break;
            case 'service':
              // swap this connection around so the arrow is pointing to the service
              var target = edge.target;
              var source = edge.source;
              edge.target = source;
              edge.source = target;
              params.target = edge.target.el;
              params.source = edge.source.el;
              params.paintStyle = {
                lineWidth: 2,
                strokeStyle: '#5555cc'
              };
              /*
              params.overlays = [
                [ 'PlainArrow', { location: 2, direction: -1, width: 4, length: 4 } ]
              ]
              */
              params.anchors = [
                [ "ContinuousLeft", { } ],
                [ "Perimeter", { shape: "Rectangle" } ]
              ];
              break;
            case 'replicationController':
              params.paintStyle = {
                lineWidth: 2,
                dashstyle: '2 2',
                strokeStyle: '#44aa44'
              }
              /*
              params.overlays = [
                [ 'PlainArrow', { location: 1, width: 4, length: 4 } ]
              ]
              */
              params.anchors = [
                [ "Perimeter", { shape: "Rectangle" } ],
                [ "ContinuousRight", { } ]
              ];
              break;
          }
          //log.debug("connection source type: ", type);
          return options;
        };
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
          var hosts = scope.hosts;
          log.debug("hosts: ", scope.hosts);
          var parentEl = angular.element($templateCache.get("overviewTemplate.html"));
          var servicesEl = parentEl.find(".services");
          var hostsEl = parentEl.find(".hosts");
          var replicationControllersEl = parentEl.find(".replicationControllers");

          servicesEl.append(createElements($templateCache.get("serviceTemplate.html"), 'service', services));
          replicationControllersEl.append(createElements($templateCache.get("replicationControllerTemplate.html"), 'replicationController', replicationControllers));

          hosts.forEach((host) => {
            var hostEl = angular.element(createElement($templateCache.get("hostTemplate.html"), 'host', host));
            var podContainer = angular.element(hostEl.find('.pod-container'));
            podContainer.append(createElements($templateCache.get("podTemplate.html"), "pod", host.pods));
            hostsEl.append(hostEl);
          });
          //parentEl.append(createElements($templateCache.get("podTemplate.html"), 'pod', pods));
          element.append($compile(parentEl)(scope));
          $timeout(() => { element.css({visibility: 'visible'}); }, 250);
        }
        function update() {
          scope.$emit('jsplumbDoWhileSuspended', () => {
            log.debug("Update");
            var services = scope.services;
            var replicationControllers = scope.replicationControllers;
            var pods = scope.pods;
            var hosts = scope.hosts;
            var parentEl = element.find('[hawtio-jsplumb]');
            var children = parentEl.find('.jsplumb-node');
            children.each((index, c) => {
              var child = angular.element(c);
              var id = child.attr('id');
              if (Core.isBlank(id)) {
                return;
              }
              var type = child.attr('data-type');
              switch (type) {
                case 'host':
                  if (id in scope.hostsById) {
                    return;
                  }
                  break;
                case 'service':
                  if (id in scope.servicesById) {
                    var service = scope.servicesById[id];
                    child.attr('connect-to', service.connectTo);
                    return;
                  }
                  break;
                case 'pod':
                  /*
                  if (hasId(pods, id)) {
                    return;
                  }
                  */
                  if (id in scope.podsById) {
                    return;
                  }
                  break;
                case 'replicationController':
                  if (id in scope.replicationControllersById) {
                    var replicationController = scope.replicationControllersById[id];
                    child.attr('connect-to', replicationController.connectTo);
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
            var servicesEl = parentEl.find(".services");
            var hostsEl = parentEl.find(".hosts");
            var replicationControllersEl = parentEl.find(".replicationControllers");
            appendNewElements(servicesEl, $templateCache.get("serviceTemplate.html"), "service", services); 
            appendNewElements(replicationControllersEl, $templateCache.get("replicationControllerTemplate.html"), "replicationController", replicationControllers); 
            appendNewElements(hostsEl, $templateCache.get("hostTemplate.html"), "host", hosts);
            hosts.forEach((host) => {
              var hostEl = parentEl.find("#" + host.id);
              appendNewElements(hostEl, $templateCache.get("podTemplate.html"), "pod", host.pods);
            });
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

  var OverviewBoxController = controller("OverviewBoxController", ["$scope", "$location", ($scope, $location:ng.ILocationService) => {
    $scope.viewDetails = (path:string) => {
      $location.path(UrlHelpers.join('/kubernetes', path)).search({'_id': $scope.entity.id });
    }
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
      var matches = pods.filter((pod) => { return label in pod.labels && pod.labels[label] === value; });
      return matches.map((pod) => { return pod.id; });
    }

    function maybeInit() {
      if (services && replicationControllers && pods) {
        $scope.servicesById = {};
        $scope.podsById = {};
        $scope.replicationControllersById = {};
        services.forEach((service) => {
          $scope.servicesById[service.id] = service;
          service.podIds = [];
          angular.forEach(service.selector, (value, key) => {
            var ids = getPodIdsForLabel(key, value);
            service.podIds = service.podIds.union(ids);
          });
          service.connectTo = service.podIds.join(',');
        });
        replicationControllers.forEach((replicationController) => {
          $scope.replicationControllersById[replicationController.id] = replicationController
          replicationController.podIds = getPodIdsForLabel('replicationController', replicationController.id);
          replicationController.connectTo = replicationController.podIds.join(',');
        });
        pods.forEach((pod) => { $scope.podsById[pod.id] = pod });
        $scope.pods = pods;
        $scope.services = services;
        $scope.replicationControllers = replicationControllers;
        $scope.count = $scope.count + 1;
      }
    }

    /*
    $scope.$watchCollection('services', (services) => {
      log.debug("got services: ", services);
    });

    $scope.$watchCollection('replicationControllers', (replicationControllers) => {
      log.debug("got replicationControllers: ", replicationControllers);
    });
    */

    $scope.$watchCollection('pods', (pods) => {
      //log.debug("got pods: ", pods);
      if (pods) {
        var hostsById = {};
        pods.forEach((pod) => {
          var host = pod.currentState.host;
          if (!(host in hostsById)) {
            hostsById[host] = [];
          }
          hostsById[host].push(pod);
        });
        var hosts = [];
        angular.forEach(hostsById, (value, key) => {
          hosts.push({
            id: key,
            pods: value
          });
        });
        $scope.hosts = hosts;
        $scope.hostsById = hostsById;
      }
    });

    $scope.$watch('hosts', (hosts) => {
      log.debug("hosts: ", hosts);
    });

  }]);

}
