/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.FabricDiagramController", ["$scope", "$compile", "$location", "localStorage", "jolokia", "workspace", ($scope, $compile, $location, localStorage, jolokia, workspace) => {
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.workspace = workspace;
    Fabric.initScope($scope, $location, jolokia, workspace);

    var isFmc = Fabric.isFMCContainer(workspace);
    $scope.isFmc = isFmc;

    $scope.selectedNode = null;

    var defaultFlags = {
      panel: true,
      popup: false,
      label: true,

      container: false,
      endpoint: true,
      route: true,
      context: false,
      consumer: true,
      producer: true
    };

    $scope.viewSettings = {
    };

    $scope.shapeSize = {
      context: 12,
      route: 10,
      endpoint: 7
    };

    var graphBuilder = new ForceGraph.GraphBuilder();

    Core.bindModelToSearchParam($scope, $location, "searchFilter", "q", "");

    angular.forEach(defaultFlags, (defaultValue, key) => {
      var modelName = "viewSettings." + key;

      // bind model values to search params...
      function currentValue() {
        var answer = $location.search()[paramName] || defaultValue;
        return answer === "false" ? false : answer;
      }

      var paramName = key;
      var value = currentValue();
      Core.pathSet($scope, modelName, value);

      $scope.$watch(modelName, () => {
        var current = Core.pathGet($scope, modelName);
        var old = currentValue();
        if (current !== old) {
          var defaultValue = defaultFlags[key];
          if (current !== defaultValue) {
            if (!current) {
              current = "false";
            }
            $location.search(paramName, current);
          } else {
            $location.search(paramName, null);
          }
        }
        redrawGraph();
      });
    });

    $scope.connectToContext = () => {
      var selectedNode = $scope.selectedNode;
      if (selectedNode) {
        var container = selectedNode["container"] || selectedNode;
        var postfix:string = null;
        connectToContainer(container, postfix);
      }
    };

    $scope.connectToEndpoint = () => {
      var selectedNode = $scope.selectedNode;
      if (selectedNode) {
        var container = selectedNode["container"] || selectedNode;
        var postfix:string = null;
        connectToContainer(container, postfix);
      }
    };

    function connectToContainer(container, postfix, viewPrefix = "#/jmx/attributes?tab=camel") {
      var view = viewPrefix;
      if (postfix) {
        view += postfix;
      }
      // TODO if local just link to local view!
      $scope.doConnect(container, view);
    }

    $scope.$on('$destroy', function (event) {
      stopOldJolokia();
    });

    function stopOldJolokia() {
      var oldJolokia = $scope.selectedNodeJolokia;
      if (oldJolokia && oldJolokia !== jolokia) {
        oldJolokia.stop();
      }
    }

    $scope.$watch("selectedNode", (newValue, oldValue) => {
      // lets cancel any previously registered thingy
      if ($scope.unregisterFn) {
        $scope.unregisterFn();
        $scope.unregisterFn = null;
      }
      var node = $scope.selectedNode;
      if (node) {
        var mbean = node.objectName;
        var container = node.container || {};
        var nodeJolokia = node.jolokia || container.jolokia || jolokia;
        if (nodeJolokia !== $scope.selectedNodeJolokia) {
          stopOldJolokia();
          $scope.selectedNodeJolokia = nodeJolokia;
          if (nodeJolokia !== jolokia) {
            var rate = Core.parseIntValue(localStorage['updateRate'] || "2000", "update rate");
            if (rate) {
              nodeJolokia.start(rate);
            }
          }
        }
        var dummyResponse = {value: node.panelProperties || {}};
        if (mbean && nodeJolokia) {
          $scope.unregisterFn = Core.register(nodeJolokia, $scope, {
            type: 'read', mbean: mbean
          }, onSuccess(renderNodeAttributes, {error: (response) => {
            // probably we've got a wrong mbean name?
            // so lets render at least
            renderNodeAttributes(dummyResponse);
            Core.defaultJolokiaErrorHandler(response);
          }}));

        } else {
          renderNodeAttributes(dummyResponse);
        }
      }
    });

    var ignoreNodeAttributes = [
      "CamelId", "CamelManagementName"
    ];

    var ignoreNodeAttributesByType = {
      context: ["ApplicationContextClassName", "CamelId", "ClassResolver", "ManagementName", "PackageScanClassResolver", "Properties"],
      endpoint: ["Camel", "Endpoint"],
      route: ["Description"]
    };

    var onlyShowAttributesByType = {
      broker: []
    };

    function renderNodeAttributes(response) {
      var properties = [];
      if (response) {
        var value = response.value || {};
        $scope.selectedNodeAttributes = value;
        var selectedNode = $scope.selectedNode || {};
        var container = selectedNode['container'] || {};
        var nodeType = selectedNode["type"];
        var brokerName = selectedNode["brokerName"];
        var containerId = container["id"];
        var group = selectedNode["group"] || container["group"];
        var jolokiaUrl = selectedNode["jolokiaUrl"] || container["jolokiaUrl"];
        var profile = selectedNode["profile"] || container["profile"];
        var version = selectedNode["version"] || container["version"];

        var isBroker = nodeType && nodeType.startsWith("broker");
        var ignoreKeys = ignoreNodeAttributes.concat(ignoreNodeAttributesByType[nodeType] || []);
        var onlyShowKeys = onlyShowAttributesByType[nodeType];

        angular.forEach(value, (v, k) => {
          if (onlyShowKeys ? onlyShowKeys.indexOf(k) >= 0 : ignoreKeys.indexOf(k) < 0) {
            var formattedValue = Core.humanizeValueHtml(v);
            properties.push({key: Core.humanizeValue(k), value: formattedValue});
          }
        });
        properties = properties.sortBy("key");

        if (containerId && isFmc) {
          //var containerModel = "selectedNode.container";
          properties.splice(0, 0, {key: "Container", value: $compile('<div fabric-container-link="' + selectedNode['container']['id'] + '"></div>')($scope)});
        }


        var typeLabel = selectedNode["typeLabel"];
        var name = selectedNode["name"] || selectedNode["id"] || selectedNode['objectName'];
        if (typeLabel) {
          var html = name;
          if (nodeType === "queue" || nodeType === "topic") {
            html = createDestinationLink(name, nodeType);
          }
          var typeProperty = {key: typeLabel, value: html};
          properties.splice(0, 0, typeProperty);
        }
      }
      $scope.selectedNodeProperties = properties;
      Core.$apply($scope);
    }


    /**
     * Generates the HTML for a link to the destination
     */
    function createDestinationLink(destinationName, destinationType = "queue") {
      return $compile('<a target="destination" title="' + destinationName + '" ng-click="connectToEndpoint()">' +
        //'<img title="View destination" src="img/icons/activemq/' + destinationType + '.png"> ' +
        destinationName +
        '</a>')($scope);
    }

    $scope.$watch("searchFilter", (newValue, oldValue) => {
      redrawGraph();
    });

    if (isFmc) {
      $scope.versionId = Fabric.getDefaultVersionId(jolokia);
      var fields = ["id", "alive", "parentId", "profileIds", "versionId", "provisionResult", "jolokiaUrl", "jmxDomains"];
      Fabric.getContainersFields(jolokia, fields, onFabricContainerData);
    } else {
      // lets just use the current stuff from the workspace
      $scope.$watch('workspace.tree', function () {
        reloadLocalJmxTree();
      });

      $scope.$on('jmxTreeUpdated', function () {
        reloadLocalJmxTree();
      });
    }

    function reloadLocalJmxTree() {
      var localContainer = {
        jolokia: jolokia
      };
      $scope.activeContainers = {
        "local": localContainer
      };
      redrawGraph();
      $scope.containerCount = 1;
    }

    function onFabricContainerData(response) {
      if (response) {
        var responseJson = angular.toJson(response);
        if ($scope.responseJson === responseJson) {
          return;
        }
        $scope.responseJson = responseJson;

        var containersToDelete = $scope.activeContainers || {};
        $scope.activeContainers = (response || {}).filter(c => c.jmxDomains.any(camelJmxDomain));
        $scope.containerCount = $scope.activeContainers.length;

        // query containers which have camel...
        redrawGraph();
      } else {
        $scope.containerCount = 0;
      }
    }

    function redrawGraph() {
      graphBuilder = new ForceGraph.GraphBuilder();

      // TODO delete any nodes from dead containers in containersToDelete
      angular.forEach($scope.activeContainers, (container, id) => {
        var containerJolokia = container.jolokia;
        if (!containerJolokia) {
          var jolokiaUrl = container["jolokiaUrl"];
          if (jolokiaUrl) {
            var url = Core.useProxyIfExternal(jolokiaUrl);
            containerJolokia = Fabric.createJolokia(url);
          }
        }
        if (containerJolokia) {
          onContainerJolokia(containerJolokia, container);
        } else {
          Fabric.containerJolokia(jolokia, id, (containerJolokia) => onContainerJolokia(containerJolokia, container));
        }
      });
      //$scope.graph = graphBuilder.buildGraph();
      Core.$apply($scope);
    }

    /**
     * Returns true if the given CamelContext ID matches the current search filter
     */
    function matchesContextId(contextId) {
      if (contextId) {
        return !$scope.searchFilter || contextId.toLowerCase().indexOf($scope.searchFilter.toLowerCase())  >= 0;
      }
      return false;
    }

    function onContainerJolokia(containerJolokia, container) {
      if (containerJolokia) {
        container.jolokia = containerJolokia;
        var containerId = container.id || "local";
        var idPrefix = containerId + ":";

        var endpointUriToObject = {};
        var startedLoadMetaDataFromEndpointMBeans = false;

        function getOrCreateRoute(objectName, properties, addEndpointLink, routeId = null, contextId = null, camelContext = null) {

          if (!objectName) {
            // lets try guess the mbean name
            objectName = camelJmxDomain + ':context=' + contextId + ',type=routes,name="' + routeId + '"';
          }
          var details = Core.parseMBean(objectName);
          var attributes = details['attributes'];
          var contextId = attributes["context"];
          if (!routeId) {
            routeId = Core.trimQuotes(attributes["name"]);
          }
          attributes["routeId"] = routeId;
          attributes["mbean"] = objectName;
          attributes["container"] = container;
          attributes["type"] = "route";

          var route = null;
          if (routeId && matchesContextId(contextId)) {
            route = getOrAddNode("route", idPrefix + routeId, attributes, () => {
              return {
                name: routeId,
                typeLabel: "Route",
                container: container,
                objectName: objectName,
                jolokia: containerJolokia,
                popup: {
                  title: "Route: " + routeId,
                  content: "<p>context: " + contextId + "</p>"
                }
              };
            });
            if (addEndpointLink) {
              var uri = properties["EndpointUri"];
              if (uri && route) {
                var endpoint = null;
                var escaledUrl = Camel.escapeEndpointUriNameForJmx(uri);
                var urlsToTry = [uri, escaledUrl];

                angular.forEach(urlsToTry, (key) => {
                  if (!endpoint) {
                    endpoint = endpointUriToObject[key];
                  }
                });
                if (!endpoint) {
                  angular.forEach(urlsToTry, (key) => {
                    if (!endpoint) {
                      var idx = key.lastIndexOf("?");
                      if (idx > 0) {
                        var prefix = key.substring(0, idx);
                        endpoint = endpointUriToObject[prefix];
                      }
                    }
                  });
                }
                addLink(route, endpoint, "consumer");
              }
            }
            if ($scope.viewSettings.route && $scope.viewSettings.context) {
              if (!camelContext) {
                camelContext = getOrCreateCamelContext(contextId);
              }
              addLink(camelContext, route, "route");
            }
          }
          return route;
        }

        function getOrCreateEndpoint(objectName, uri = null, contextId = null) {

          if (!objectName) {
            // lets try guess the mbean name
            objectName = camelJmxDomain + ':context=' + contextId + ',type=endpoints,name="' + Camel.escapeEndpointUriNameForJmx(uri) + '"';
          }
          var details = Core.parseMBean(objectName);
          var attributes = details['attributes'];
          //log.info("attributes: " + angular.toJson(attributes));
          var contextId = attributes["context"];
          if (!uri) {
            uri = Core.trimQuotes(attributes["name"]);
          }
          attributes["uri"] = uri;
          attributes["mbean"] = objectName;
          attributes["container"] = container;
          attributes["contextId"] = contextId;

          var endpoint = null;
          if (uri && matchesContextId(contextId)) {
            endpoint = getOrAddNode("endpoint", idPrefix + uri, attributes, () => {
              return {
                name: uri,
                typeLabel: "Endpoint",
                container: container,
                objectName: objectName,
                jolokia: containerJolokia,
                popup: {
                  title: "Endpoint: " + uri,
                  content: "<p>context: " + contextId + "</p>"
                }
              };
            });
            if (endpoint) {
              endpointUriToObject[uri] = endpoint;
            }
          }
          return endpoint;
        }

        // lets use the old way for pre-camel 2.13 versions
        function loadMetaDataFromEndpointMBeans() {
           // find routes
          if ($scope.viewSettings.route) {
            containerJolokia.request({type: "read", mbean: camelJmxDomain + ":type=routes,*", attribute: ["EndpointUri"]}, onSuccess((response) => {
              angular.forEach(response.value, (properties, objectName) => {
                getOrCreateRoute(objectName, properties, true);
              });
              graphModelUpdated();
            }));
          }

          if ($scope.viewSettings.endpoint) {
            containerJolokia.search(camelJmxDomain + ":type=endpoints,*", onSuccess((response) => {
              angular.forEach(response, (objectName) => {
                var endpoint = getOrCreateEndpoint(objectName);
                var camelContext = getOrCreateCamelContext(null, objectName);
                addLink(camelContext, endpoint, "endpoint");
              });
              graphModelUpdated();
            }));
          }

        }

        function getOrCreateCamelContext(contextId, contextMBean = null) {
          var answer = null;
          if (matchesContextId(contextId)) {
            if (!contextMBean) {
              // try guess the mbean name
              contextMBean = camelJmxDomain + ':context=' + contextId + ',type=context,name="' + contextId + '"';
            }
            if (!contextId && contextMBean) {
              var details = Core.parseMBean(contextMBean);
              var attributes = details['attributes'];
              contextId = attributes["context"];
            }
            var contextAttributes = {
              contextId: contextId
            };

            if ($scope.viewSettings.context) {
              answer = getOrAddNode("context", idPrefix + contextId, contextAttributes, () => {
                return {
                  name: contextId,
                  typeLabel: "CamelContext",
                  container: container,
                  objectName: contextMBean,
                  jolokia: containerJolokia,
                  popup: {
                    title: "CamelContext: " + contextId,
                    content: ""
                  }
                };
              });
            }

            // lets try out the new Camel 2.13 API to find endpoint usage...
            containerJolokia.execute(contextMBean, "createRouteStaticEndpointJson", onSuccess((response) => {
              if (angular.isString(response)) {
                var text = response;
                var data = null;
                try {
                  data = JSON.parse(text);
                } catch (e) {
                  // there's a bug in 2.13.0 - lets try trimming the final '}' to see if that makes it valid json ;)
                  text = Core.trimTrailing(text.trim(), "}");
                  try {
                    data = JSON.parse(text);
                  } catch (e2) {
                    log.debug("Ignored invalid json: " + e + " from text: " + response);
                  }
                }
              }
              if (data) {
                angular.forEach(data["routes"], (routeData, routeId) => {
                  angular.forEach(routeData["inputs"], (inputEndpoint) => {
                    var inputUri = inputEndpoint["uri"];
                    if (inputUri) {
                      var route = getOrCreateRoute(null, {}, false, routeId, contextId, answer);
                      var input = getOrCreateEndpoint(null, inputUri, contextId);
                      var nextStep = route;
                      addLink(input, route, "endpoint");
                      angular.forEach(routeData["outputs"], (outputEndpoint) => {
                        var outputUri = outputEndpoint["uri"];
                        if (outputUri) {
                          var output = getOrCreateEndpoint(null, outputUri, contextId);
                          addLink(nextStep, output, "endpoint");
                          nextStep = output;
                        }
                      });
                    }
                  })
                });
                log.info("Updating graph model!");
                graphModelUpdated();
              }
            }, {
              error: (response) => {
                // probably a pre-2.13 Camel implementation so lets use the old way
                if (!startedLoadMetaDataFromEndpointMBeans) {
                  startedLoadMetaDataFromEndpointMBeans = true;
                  loadMetaDataFromEndpointMBeans();
                }
              }
            }))
          }
          return answer;
        }

        containerJolokia.search(camelJmxDomain + ":type=context,*", onSuccess((response) => {
          angular.forEach(response, (objectName) => {
            var details = Core.parseMBean(objectName);
            var attributes = details['attributes'];
            var contextId = attributes["context"];
            var uri = Core.trimQuotes(attributes["name"]);
            getOrCreateCamelContext(contextId, objectName);
          });
          //graphModelUpdated();
        }));

      }
    }

    function graphModelUpdated() {
      $scope.graph = graphBuilder.buildGraph();
      Core.$apply($scope);
    }

    function getOrAddNode(typeName:string, id, properties, createFn) {
      var node = null;
      if (id) {
        var nodeId = typeName + ":" + id;
        node = graphBuilder.getNode(nodeId);
        if (!node) {
          var nodeValues = createFn();
          node = angular.copy(properties);
          angular.forEach(nodeValues, (value, key) => node[key] = value);

          node['id'] = nodeId;
          if (!node['type']) {
            node['type'] = typeName;
          }
          if (!node['name']) {
            node['name'] = id;
          }
          if (node) {
            var size = $scope.shapeSize[typeName];
            if (size && !node['size']) {
              node['size'] = size;
            }
            if (!node['summary']) {
              node['summary'] = node['popup'] || "";
            }
            if (!$scope.viewSettings.popup) {
              delete node['popup'];
            }
            if (!$scope.viewSettings.label) {
              delete node['name'];
            }
            // lets not add nodes which are defined as being disabled
            var enabled = $scope.viewSettings[typeName];
            if (enabled || !angular.isDefined(enabled)) {
              //log.info("==== Adding node " + nodeId + " of type + " + typeName);
              graphBuilder.addNode(node);
            } else {
              //log.info("Ignoring node " + nodeId + " of type + " + typeName);
            }
          }
        }
      }
      return node;
    }

    function addLink(object1, object2, linkType) {
      if (object1 && object2) {
        addLinkIds(object1.id, object2.id, linkType);
      }
    }

    function addLinkIds(id1, id2, linkType) {
      if (id1 && id2) {
        //log.info("==== Linking " + id1 + " to " + id2);
        graphBuilder.addLink(id1, id2, linkType);
      }
    }

    /**
     * Avoid the JMX type property clashing with the ForceGraph type property; used for associating css classes with nodes on the graph
     *
     * @param properties
     */
    function renameTypeProperty(properties) {
      properties.mbeanType = properties['type'];
      delete properties['type'];
    }

    function configureEndpointProperties(properties) {
      renameTypeProperty(properties);
      var destinationType = properties.destinationType || "Queue";
      var typeName = destinationType.toLowerCase();
      properties.isQueue = !typeName.startsWith("t");
      properties['destType'] = typeName;
    }
  }]);
}
