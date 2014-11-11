/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../helpers/js/arrayHelpers.ts"/>
module Kubernetes {

  var OverviewDirective = _module.directive("kubernetesOverview", ["$templateCache", "$compile", "$interpolate", "$timeout", "$window", ($templateCache:ng.ITemplateCacheService, $compile:ng.ICompileService, $interpolate:ng.IInterpolateService, $timeout:ng.ITimeoutService, $window:ng.IWindowService) => {
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
        $window.addEventListener("resize", () => {
          if (scope.jsPlumb) {
            scope.jsPlumb.recalculateOffsets(element);
            scope.jsPlumb.repaintEverything();
            log.debug("jsplumb: ", scope.jsPlumb);
          }
        });
        scope.mouseEnter = ($event) => {
          if (scope.jsPlumb) {
            angular.element($event.currentTarget).addClass("hovered");
            scope.jsPlumb.getEndpoints($event.currentTarget).forEach((endpoint) => {
              endpoint.connections.forEach((connection) => {
                if (!connection.isHover()) {
                  connection.setHover(true);
                  connection.endpoints.forEach((e) => {
                    scope.mouseEnter({
                      currentTarget: e.element
                    });
                  });
                }
              });
            });
          }
        }
        scope.mouseLeave = ($event) => {
          if (scope.jsPlumb) {
            angular.element($event.currentTarget).removeClass("hovered");
            scope.jsPlumb.getEndpoints($event.currentTarget).forEach((endpoint) => {
              endpoint.connections.forEach((connection) => {
                if (connection.isHover()) {
                  connection.setHover(false);
                  connection.endpoints.forEach((e) => {
                    scope.mouseLeave({
                      currentTarget: e.element
                    });
                  });
                }
              });
            });
          }
        }
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
                [ "ContinuousRight", { shape: "Rectangle" } ]
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
                [ "ContinuousLeft", { shape: "Rectangle" } ],
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
          // log.debug("hosts: ", scope.hosts);
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
    $scope.hosts = null;

    $scope.count = 0;
    var redraw = false;

    var services = [];
    var replicationControllers = [];
    var pods = [];
    var hosts = [];
    var byId = (thing) => { return thing.id; };

    KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
      KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
        KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
          $scope.fetch = PollHelpers.setupPolling($scope, (next: () => void) => {
            var ready = 0;
            var numServices = 3;
            function maybeNext(count) {
              ready = count;
              // log.debug("Completed: ", ready);
              if (ready >= numServices) {
                // log.debug("Fetching another round");
                maybeInit();
                next();
              }
            }
            KubernetesServices.query((response) => {
              if (response) {
                var items = (response.items || []).sortBy(byId);
                redraw = ArrayHelpers.sync(services, items);
              }
              maybeNext(ready + 1);
            });
            KubernetesReplicationControllers.query((response) => {
              if (response) {
                var items = (response.items || []).sortBy(byId);
                redraw = ArrayHelpers.sync(replicationControllers, items);
              }
              maybeNext(ready + 1);
            });
            KubernetesPods.query((response) => {
              if (response) {
                var items = (response.items || []).sortBy(byId);
                redraw = ArrayHelpers.sync(pods, items);
              }
              maybeNext(ready + 1);
            });
          });
          $scope.fetch();
        });
      });
    });
    function selectPods(pods, labels) {
      var matchFunc = _.matches(labels);
      return pods.filter((pod) => { return matchFunc(pod.labels, undefined, undefined); });
    }
    function maybeInit() {
      if (services && replicationControllers && pods) {
        $scope.servicesById = {};
        $scope.podsById = {};
        $scope.replicationControllersById = {};
        services.forEach((service) => {
          $scope.servicesById[service.id] = service;
          var selectedPods = selectPods(pods, service.selector);
          service.connectTo = selectedPods.map((pod) => { return pod.id; }).join(',');
        });
        replicationControllers.forEach((replicationController) => {
          $scope.replicationControllersById[replicationController.id] = replicationController
          var selectedPods = selectPods(pods, replicationController.desiredState.replicaSelector);
          replicationController.connectTo = selectedPods.map((pod) => { return pod.id; }).join(',');
        });
        var hostsById = {};
        pods.forEach((pod) => {
          $scope.podsById[pod.id] = pod;
          var host = pod.currentState.host;
          if (!(host in hostsById)) {
            hostsById[host] = [];
          }
          hostsById[host].push(pod);
        });
        var tmpHosts = [];
        var oldHostsLength = hosts.length;
        angular.forEach(hostsById, (value, key) => {
          tmpHosts.push({
            id: key,
            pods: value
          });
        });
        redraw = ArrayHelpers.removeElements(hosts, tmpHosts);
        tmpHosts.forEach((newHost) => {
          var oldHost:any = hosts.find((h) => { return h.id === newHost.id });
          if (!oldHost) {
            redraw = true;
            hosts.push(newHost);
          } else {
            redraw = ArrayHelpers.sync(oldHost.pods, newHost.pods);
          }
        });
        $scope.hosts = hosts;
        $scope.hostsById = hostsById;
        $scope.pods = pods;
        $scope.services = services;
        $scope.replicationControllers = replicationControllers;
        if (redraw) {
          log.debug("Redrawing");
          $scope.count = $scope.count + 1;
          redraw = false;
        }
      }
    }

  }]);

}
