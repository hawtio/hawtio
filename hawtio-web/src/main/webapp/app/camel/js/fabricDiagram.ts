module Camel {

  export function FabricDiagramController($scope, $compile, $location, localStorage, jolokia, workspace) {

    Fabric.initScope($scope, $location, jolokia, workspace);

    var isFmc = Fabric.isFMCContainer(workspace);

    $scope.selectedNode = null;

    var defaultFlags = {
      panel: true,
      popup: false,
      label: true,

      container: false,
      endpoint: true,
      route: true,
      consumer: true,
      producer: true
    };

    $scope.viewSettings = {
    };

    $scope.shapeSize = {
      context: 14
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
        var postfix: string = null;
        connectToContainer(container, postfix);
      }
    };

    $scope.connectToEndpoint = () => {
      var selectedNode = $scope.selectedNode;
      if (selectedNode) {
        var container = selectedNode["container"] || selectedNode;
        var postfix: string = null;
/*
        var brokerName = selectedNode["brokerName"];
        var destinationType = selectedNode["destinationType"];
        var destinationName = selectedNode["destinationName"];
        if (brokerName && destinationType && destinationName) {
          postfix = "nid=root-org.apache.activemq-Broker-" + brokerName + "-" + destinationType + "-" + destinationName;
        }
*/
        connectToContainer(container, postfix);
      }
    };

    function connectToContainer(container, postfix, viewPrefix = "/jmx/attributes?tab=camel") {
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

    function getDestinationTypeName(attributes) {
      var prefix = attributes["DestinationTemporary"] ? "Temporary " : "";
      return prefix + (attributes["DestinationTopic"] ? "Topic" : "Queue");
    }

    var ignoreNodeAttributes = [
    ];

    var ignoreNodeAttributesByType = {
      context: ["ApplicationContextClassName", "CamelId", "ClassResolver","ManagementName", "PackageScanClassResolver", "Properties"],
      endpoint: ["Camel", "Endpoint"],
      route: []
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
          if (onlyShowKeys ? onlyShowKeys.indexOf(k) >= 0: ignoreKeys.indexOf(k) < 0) {
            var formattedValue = Core.humanizeValueHtml(v);
            properties.push({key: humanizeValue(k), value: formattedValue});
          }
        });
        properties = properties.sortBy("key");

/*
        var brokerProperty: any = null;
        if (brokerName) {
          var html = brokerName;
          if (version && profile) {
            var brokerLink = Fabric.brokerConfigLink(workspace, jolokia, localStorage, version, profile, brokerName);
            if (brokerLink) {
              html = $compile('<a target="broker" ng-click="connectToContext()">' +
                '<img title="Apache ActiveMQ" src="app/fabric/img/message_broker.png"> ' + brokerName +
                '</a> <a title="configuration settings" target="brokerConfig" href="' + brokerLink +
                '"><i class="icon-tasks"></i></a>')($scope);
            }
          }
          brokerProperty = {key: "Broker", value: html};
          if (!isBroker) {
            properties.splice(0, 0, brokerProperty);
          }
        }

*/
        if (containerId && isFmc) {
          var containerModel = "selectedNode.container";
          properties.splice(0, 0, {key: "Container", value: $compile('<div fabric-container-link="' + containerModel + '"></div>')($scope)});
        }

/*
        var destinationName = value["DestinationName"] || selectedNode["destinationName"];
        if (destinationName && (nodeType !== "queue" && nodeType !== "topic")) {
          var destinationTypeName = getDestinationTypeName(value);
          var html = createDestinationLink(destinationName, destinationTypeName);
          properties.splice(0, 0, {key: destinationTypeName, value: html});
        }
*/

        var typeLabel = selectedNode["typeLabel"];
        var name = selectedNode["name"] || selectedNode["id"] || selectedNode['objectName'];
        if (typeLabel) {
          var html = name;
          if (nodeType === "queue" || nodeType === "topic") {
            html = createDestinationLink(name, nodeType);
          }
          var typeProperty = {key: typeLabel, value: html};
/*
          if (isBroker && brokerProperty) {
            typeProperty = brokerProperty;
          }
*/
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
                                  //'<img title="View destination" src="app/activemq/img/' + destinationType + '.png"> ' +
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
        $scope.activeContainers = (response || {}).filter(c => c.jmxDomains.any(Camel.jmxDomain));
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
      $scope.graph = graphBuilder.buildGraph();
      Core.$apply($scope);
    }

    function onContainerJolokia(containerJolokia, container) {
      if (containerJolokia) {
        container.jolokia = containerJolokia;
        var containerId = container.id || "local";

        // find endpoints
        if ($scope.viewSettings.endpoint) {
/*
          containerJolokia.request({type: "read", mbean: "org.apache.camel:type=endpoints,*"}, onSuccess((response) => {
            angular.forEach(response.value, (properties, objectName) => {
*/
          containerJolokia.search("org.apache.camel:type=endpoints,*", onSuccess((response) => {
            angular.forEach(response, (objectName) => {
              var details = Core.parseMBean(objectName);
              var attributes = details['attributes'];
              //log.info("attributes: " + angular.toJson(attributes));
              var contextId = attributes["context"];
              var uri = trimQuotes(attributes["name"]);
              log.info("context " + contextId + " endpoint " + uri);
              attributes["uri"] = uri;
              attributes["mbean"] = objectName;
              attributes["container"] = container;

              if (uri && contextId) {
                var idPrefix = containerId + ":";
                // try guess the mbean name
                var contextMBean = Camel.jmxDomain + ':context=' + contextId + ',type=context,name="' + contextId + '"';
                var contextAttributes = {
                    contextId: contextId
                };

                var consumer = getOrAddNode("endpoint", idPrefix + uri, attributes, () => {
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
                var camelContext = getOrAddNode("context", idPrefix + contextId, contextAttributes, () => {
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
                addLink(camelContext, consumer, "consumer");
              }

            });
            graphModelUpdated();
          }));
        }
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
              //log.info("Adding node " + nodeId + " of type + " + typeName);
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
  }
}