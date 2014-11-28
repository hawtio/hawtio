/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../helpers/js/arrayHelpers.ts"/>
/// <reference path="../../wiki/js/wikiHelpers.ts"/>
module Kubernetes {

  var OverviewDirective = _module.directive("kubernetesOverview", ["$templateCache", "$compile", "$interpolate", "$timeout", "$window", ($templateCache:ng.ITemplateCacheService, $compile:ng.ICompileService, $interpolate:ng.IInterpolateService, $timeout:ng.ITimeoutService, $window:ng.IWindowService) => {
    return {
      restrict: 'E',
      replace: true,
      link: (scope, element, attr) => {
        element.css({visibility: 'hidden'});
        scope.getEntity = (type:string, key:string) => {
          switch (type) {
            case 'host':
              return scope.hostsByKey[key];
            case 'pod':
              return scope.podsByKey[key];
            case 'replicationController':
              return scope.replicationControllersByKey[key];
            case 'service':
              return scope.servicesByKey[key];
            default:
              return undefined;

          }
        }
        scope.customizeDefaultOptions = (options) => {
          options.Endpoint = ['Blank', {}];
        };
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
                [ "Perimeter", { shape: "Circle" } ],
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
            var existing = parentEl.find("#" + thing['_key']);
            if (!existing.length) {
              parentEl.append($compile(createElement(template, thingName, thing))(scope));
            }
          });
        }
        function namespaceFilter(item) {
            return item.namespace === scope.selectedNamespace;
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

          servicesEl.append(createElements($templateCache.get("serviceTemplate.html"), 'service', services.filter(namespaceFilter)));
          replicationControllersEl.append(createElements($templateCache.get("replicationControllerTemplate.html"), 'replicationController', replicationControllers.filter(namespaceFilter)));

          hosts.forEach((host) => {
            var hostEl = angular.element(createElement($templateCache.get("hostTemplate.html"), 'host', host));
            var podContainer = angular.element(hostEl.find('.pod-container'));
            podContainer.append(createElements($templateCache.get("podTemplate.html"), "pod", host.pods.filter(namespaceFilter)));
            hostsEl.append(hostEl);
          });
          //parentEl.append(createElements($templateCache.get("podTemplate.html"), 'pod', pods));
          element.append($compile(parentEl)(scope));
          $timeout(() => { element.css({visibility: 'visible'}); }, 250);
        }
        function update() {
          scope.$emit('jsplumbDoWhileSuspended', () => {
            log.debug("Update");
            var services = scope.services.filter(namespaceFilter);
            var replicationControllers = scope.replicationControllers.filter(namespaceFilter);
            var pods = scope.pods.filter(namespaceFilter);
            var hosts = scope.hosts;
            var parentEl = element.find('[hawtio-jsplumb]');
            var children = parentEl.find('.jsplumb-node');
            children.each((index, c) => {
              var child = angular.element(c);
              var key = child.attr('id');
              if (Core.isBlank(key)) {
                return;
              }
              var type = child.attr('data-type');
              switch (type) {
                case 'host':
                  if (key in scope.hostsByKey) {
                    return;
                  }
                  break;
                case 'service':
                  if (key in scope.servicesByKey && scope.servicesByKey[key].namespace == scope.selectedNamespace) {
                    var service = scope.servicesByKey[key];
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
                  if (key in scope.podsByKey && scope.podsByKey[key].namespace == scope.selectedNamespace) {
                    return;
                  }
                  break;
                case 'replicationController':
                  if (key in scope.replicationControllersByKey && scope.replicationControllersByKey[key].namespace == scope.selectedNamespace) {
                    var replicationController = scope.replicationControllersByKey[key];
                    child.attr('connect-to', replicationController.connectTo);
                    return;
                  }
                  break;
                default: 
                  log.debug("Ignoring element with unknown type");
                  return;
              }
              log.debug("Removing: ", key);
              child.remove();
            });
            var servicesEl = parentEl.find(".services");
            var hostsEl = parentEl.find(".hosts");
            var replicationControllersEl = parentEl.find(".replicationControllers");
            appendNewElements(servicesEl, $templateCache.get("serviceTemplate.html"), "service", services.filter(namespaceFilter));
            appendNewElements(replicationControllersEl, $templateCache.get("replicationControllerTemplate.html"), "replicationController", replicationControllers.filter(namespaceFilter));
            appendNewElements(hostsEl, $templateCache.get("hostTemplate.html"), "host", hosts);
            hosts.forEach((host) => {
              var hostEl = parentEl.find("#" + host._key);
              appendNewElements(hostEl, $templateCache.get("podTemplate.html"), "pod", host.pods.filter(namespaceFilter));
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
      $location.path(UrlHelpers.join('/kubernetes/namespace', $scope.entity.namespace, path)).search({'_id': $scope.entity.id });
    }
  }]);

  var scopeName = "OverviewController";

  var OverviewController = controller(scopeName, ["$scope", "KubernetesServices", "KubernetesPods", "KubernetesReplicationControllers", ($scope, KubernetesServices, KubernetesPods, KubernetesReplicationControllers) => {
    $scope.name = scopeName;
    $scope.namespaces = null;
    $scope.services = null;
    $scope.replicationControllers = null;
    $scope.pods = null;
    $scope.hosts = null;

    $scope.count = 0;
    $scope.selectedNamespace = null;
    var redraw = false;

    var namespaces = [];
    var services = [];
    var replicationControllers = [];
    var pods = [];
    var hosts = [];
    var byId = (thing) => { return thing.id; };
    var byNamespace = (thing) => { return thing.namespace; };

    function pushIfNotExists(array, items) {
        angular.forEach(items, (value) => {
            if ($.inArray(value, array) < 0) {
              array.push(value);
            }
        });
    };

    function populateKey(item) {
        var result = item;
        result['_key']=item.namespace+"-"+item.id;
        return result;
    };

    function populateKeys(items:Array<any>) {
        var result = [];
        angular.forEach(items, (item) => {
            result.push(populateKey(item));
        });
        return result;
    };


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
                var items = populateKeys((response.items || []).sortBy(byId));
                redraw = ArrayHelpers.sync(services, items, "_key");
              }
              maybeNext(ready + 1);
            });
            KubernetesReplicationControllers.query((response) => {
              if (response) {
                var items = populateKeys((response.items || []).sortBy(byId));
                redraw = ArrayHelpers.sync(replicationControllers, items, "_key");
              }
              maybeNext(ready + 1);
            });
            KubernetesPods.query((response) => {
              if (response) {
                var items = populateKeys((response.items || []).sortBy(byId));
                redraw = ArrayHelpers.sync(pods, items, "_key");
              }
              maybeNext(ready + 1);
            });
          });
          $scope.fetch();
        });
      });
    });
    function selectPods(pods, namespace, labels) {
      var matchFunc = _.matches(labels);
      return pods.filter((pod) => { return pod.namespace === namespace && matchFunc(pod.labels, undefined, undefined); });
    }
    function maybeInit() {
      if (services && replicationControllers && pods) {
        $scope.servicesByKey = {};
        $scope.podsByKey = {};
        $scope.replicationControllersByKey = {};
        $scope.namespaces = {};
        services.forEach((service) => {
          $scope.servicesByKey[service._key] = service;
          var selectedPods = selectPods(pods, service.namespace, service.selector);
          service.connectTo = selectedPods.map((pod) => { return pod._key; }).join(',');
        });
        replicationControllers.forEach((replicationController) => {
          $scope.replicationControllersByKey[replicationController._key] = replicationController
          var selectedPods = selectPods(pods, replicationController.namespace, replicationController.desiredState.replicaSelector);
          replicationController.connectTo = selectedPods.map((pod) => { return pod._key; }).join(',');
        });
        var hostsByKey = {};
        pods.forEach((pod) => {
          $scope.podsByKey[pod._key] = pod;
          var host =  pod.currentState.host;
          hostsByKey[host] = hostsByKey[host] || [];
          hostsByKey[host].push(pod);

        });
        var tmpHosts = [];
        var oldHostsLength = hosts.length;

          for (var hostKey in hostsByKey) {
              tmpHosts.push({
                  id: hostKey,
                  pods: hostsByKey[hostKey]
              });
          }

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

        pushIfNotExists(namespaces, pods.map(byNamespace));
        pushIfNotExists(namespaces, services.map(byNamespace));
        pushIfNotExists(namespaces, replicationControllers.map(byNamespace));

        $scope.namespaces = namespaces;
        $scope.selectedNamespace = $scope.selectedNamespace || $scope.namespaces[0];
        $scope.hosts = hosts;
        $scope.hostsByKey = hostsByKey;
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
