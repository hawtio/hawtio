module Fabric {

  export function FabricBrokerDiagramController($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache) {

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.selectedNode = null;

    var defaultFlags = {
      panel: true,
      popup: false,
      label: true,

      group: false,
      profile: false,
      slave: false,
      broker: true,
      network: true,
      container: false,
      queue: true,
      topic: true,
      consumer: true,
      producer: true
    };

    $scope.viewSettings = {
    };

    $scope.shapeSize = {
      broker: 20,
      queue: 14,
      topic: 14
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

    $scope.$watch("selectedNode", (newValue, oldValue) => {
      //log.info("Has selected: " + angular.toJson($scope.selectedNode));
      // lets cancel any previously registered thingy
      if ($scope.unregisterFn) {
        $scope.unregisterFn();
        $scope.unregisterFn = null;
      }
      var node = $scope.selectedNode;
      if (node) {
        var mbean = node.objectName;
        var jolokia = node.jolokia || jolokia;
        if (mbean && jolokia) {
          $scope.unregisterFn = Core.register(jolokia, $scope, {
            type: 'read', mbean: mbean
          }, onSuccess(renderNodeAttributes));
        }
      }
    });

    function renderNodeAttributes(response) {
      $scope.selectedNodeProperties = [];
      if (response) {
        var value = response.value;
        log.info("Got Node attributes! " + value);
        log.info(angular.toJson(value));
        $scope.selectedNodeAttributes = value;
        angular.forEach(value, (v, k) => {
          var formattedValue = humanizeValue(v);
          $scope.selectedNodeProperties.push({key: k, value: formattedValue});
        });
        $scope.selectedNodeProperties = $scope.selectedNodeProperties.sortBy("key");
        Core.$apply($scope);
      }
    }

    $scope.$watch("searchFilter", (newValue, oldValue) => {
      redrawGraph();
    });

    if (Fabric.hasMQManager) {
      Core.register(jolokia, $scope, {type: 'exec', mbean: Fabric.mqManagerMBean, operation: "loadBrokerStatus()"}, onSuccess(onBrokerData));
    }

    function onBrokerData(response) {
      if (response) {
        var responseJson = angular.toJson(response.value);
        if ($scope.responseJson === responseJson) {
          return;
        }

        $scope.responseJson = responseJson;

        $scope.brokers = response.value;
        redrawGraph();
      }
    }

    function redrawGraph() {
      graphBuilder = new ForceGraph.GraphBuilder();

      var containersToDelete = $scope.activeContainers || {};
      $scope.activeContainers = {};

      angular.forEach($scope.brokers, (brokerStatus) => {
        // only query master brokers which are provisioned correctly
        brokerStatus.validContainer = brokerStatus.alive && brokerStatus.master && brokerStatus.provisionStatus === "success";
        // don't use type field so we can use it for the node types..
        renameTypeProperty(brokerStatus);
        //log.info("Broker status: " + angular.toJson(brokerStatus, true));

        var groupId = brokerStatus.group;
        var profileId = brokerStatus.profile;
        var brokerId = brokerStatus.brokerName;
        var containerId = brokerStatus.container;
        var versionId = brokerStatus.version || "1.0";

        var group = getOrAddNode("group", groupId, brokerStatus, () => {
          return {
            /*
             navUrl: ,
             image: {
             url: "/hawtio/app/osgi/img/bundle.png",
             width: 32,
             height:32
             },
             */
            typeLabel: "Broker Group",
            popup: {
              title: "Broker Group: " + groupId,
              content: "<p>" + groupId + "</p>"
            }
          };
        });

        var profile = getOrAddNode("profile", profileId, brokerStatus, () => {
          return {
            typeLabel: "Profile",
            popup: {
              title: "Profile: " + profileId,
              content: "<p>" + profileId + "</p>"
            }
          };
        });
        var master = brokerStatus.master;
        var broker = null;
        var brokerFlag = master ? $scope.viewSettings.broker : $scope.viewSettings.slave;
        if (brokerFlag) {
          broker = getOrAddNode("broker", brokerId, brokerStatus, () => {
            return {
              type: master ? "broker" : "brokerSlave",
              typeLabel: master ? "Broker" : "Slave Broker",
              popup: {
                title: (master ? "Master" : "Slave") + " Broker: " + brokerId,
                content: "<p>Container: " + containerId + "</p> <p>Group: " + groupId + "</p>"
              }
            };
          });
        }

        // TODO do we need to create a physical broker node per container and logical broker maybe?
        var container = null;
        if (containerId) {
          container = getOrAddNode("container", containerId, brokerStatus, () => {
            return {
              containerId: containerId,
              typeLabel: "Container",
              popup: {
                title: "Container: " + containerId,
                content: "<p>" + containerId + " version: " + versionId + "</p>"
              }
            };
          });
        }


        if (container && container.validContainer) {
          var key = container.containerId;
          $scope.activeContainers[key] = container;
          delete containersToDelete[key];
        }

        // add the links...
        if ($scope.viewSettings.group) {
          if ($scope.viewSettings.profile) {
            addLink(group, profile, "group");
            addLink(profile, broker, "broker");
          } else {
            addLink(group, broker, "group");
          }
        } else {
          if ($scope.viewSettings.profile) {
            addLink(profile, broker, "broker");
          }
        }

        if (container) {
          if ((master || $scope.viewSettings.slave) && $scope.viewSettings.container) {
            addLink(broker, container, "container");
            container.destinationLinkNode = container;
          } else {
            container.destinationLinkNode = broker;
          }
        }
      });

      // TODO delete any nodes from dead containers in containersToDelete
      angular.forEach($scope.activeContainers, (container, id) => {
        var containerJolokia = container.jolokia;
        if (containerJolokia) {
          onContainerJolokia(containerJolokia, container, id);
        } else {
          Fabric.containerJolokia(jolokia, id, (containerJolokia) => onContainerJolokia(containerJolokia, container, id));
        }
      });
      $scope.graph = graphBuilder.buildGraph();
      Core.$apply($scope);
    }

    function brokerNameMarkup(brokerName) {
      return brokerName ? "<p></p>broker: " + brokerName + "</p>" : "";
    }

    function onContainerJolokia(containerJolokia, container, id) {
      if (containerJolokia) {
        container.jolokia = containerJolokia;

        function getOrAddDestination(properties) {
          var typeName = properties.destType;
          var destinationName = properties.destinationName;
          if (!destinationName || ($scope.searchFilter && destinationName.indexOf($scope.searchFilter) < 0)) {
            return null;
          }
          // should we be filtering this destination out
          var hideFlag = "topic" === typeName ? $scope.viewSettings.topic: $scope.viewSettings.queue;
          if (!hideFlag) {
            return null;
          }
          return getOrAddNode(typeName, destinationName, properties, () => {
            return {
              typeLabel: properties.destinationType || "Queue",
              popup: {
                title: (properties.destinationType || "Queue") + ": " + destinationName,
                content: brokerNameMarkup(properties.brokerName)
              }
            };
          });
        }

        // find networks
        var brokerId = container.brokerName;
        if (brokerId && $scope.viewSettings.network && $scope.viewSettings.broker) {
          containerJolokia.request({type: "read", mbean: "org.apache.activemq:connector=networkConnectors,*"}, onSuccess((response) => {
            angular.forEach(response.value, (properties, objectName) => {
              var details = Core.parseMBean(objectName);
              var attributes = details['attributes'];
              if (properties) {
                configureDestinationProperties(properties);
                var remoteBrokerId = properties.RemoteBrokerName;
                if (remoteBrokerId) {
                  var brokerIdPrefix = "broker:";
                  addLinkIds(brokerIdPrefix + brokerId, brokerIdPrefix + remoteBrokerId, "network");
                }
              }
            });
            graphModelUpdated();
          }));
        }


        // find consumers
        if ($scope.viewSettings.consumer) {
          containerJolokia.search("org.apache.activemq:endpoint=Consumer,*", onSuccess((response) => {
            angular.forEach(response, (objectName) => {
              //log.info("Got consumer: " + objectName + " on container: " + id);
              var details = Core.parseMBean(objectName);
              if (details) {
                var properties = details['attributes'];
                if (properties) {
                  configureDestinationProperties(properties);
                  var consumerId = properties.consumerId;
                  if (consumerId) {
                    var destination = getOrAddDestination(properties);
                    if (destination) {
                      addLink(container.destinationLinkNode, destination, "destination");
                      var consumer = getOrAddNode("consumer", consumerId, properties, () => {
                        return {
                          typeLabel: "Consumer",
                          objectName: objectName,
                          jolokia: containerJolokia,
                          popup: {
                            title: "Consumer: " + consumerId,
                            content: "<p>client: " + (properties.clientId || "") + "</p> " + brokerNameMarkup(properties.brokerName)
                          }
                        };
                      });
                      addLink(destination, consumer, "consumer");
                    }
                  }
                }
              }
            });
            graphModelUpdated();
          }));
        }

        // find producers
        if ($scope.viewSettings.producer) {
          containerJolokia.search("org.apache.activemq:endpoint=Producer,*", onSuccess((response) => {
            angular.forEach(response, (objectName) => {
              var details = Core.parseMBean(objectName);
              if (details) {
                var properties = details['attributes'];
                if (properties) {
                  configureDestinationProperties(properties);
                  var producerId = properties.producerId;
                  if (producerId) {
                    var destination = getOrAddDestination(properties);
                    if (destination) {
                      addLink(container.destinationLinkNode, destination, "destination");
                      var producer = getOrAddNode("producer", producerId, properties, () => {
                        return {
                          typeLabel: "Producer",
                          objectName: objectName,
                          jolokia: containerJolokia,
                          popup: {
                            title: "Producer: " + producerId,
                            content: "<p>client: " + (properties.clientId || "") + "</p> " + brokerNameMarkup(properties.brokerName)
                          }
                        };
                      });
                      addLink(producer, destination, "producer");
                    }
                    graphModelUpdated();
                  }
                }
              }
            });
            graphModelUpdated();
          }));
        }

        // find dynamic producers
        if ($scope.viewSettings.producer) {
          containerJolokia.request({type: "read", mbean: "org.apache.activemq:endpoint=dynamicProducer,*"}, onSuccess((response) => {
            angular.forEach(response.value, (mbeanValues, objectName) => {
              var details = Core.parseMBean(objectName);
              var attributes = details['attributes'];
              var properties = {};
              angular.forEach(attributes, (value, key) => {
                properties[key] = value;
              });
              angular.forEach(mbeanValues, (value, key) => {
                properties[key] = value;
              });
              configureDestinationProperties(properties);
              properties['destinationName'] = properties['DestinationName'];
              var producerId = properties["producerId"] || properties["ProducerId"];
              if (properties["DestinationTemporary"] || properties["DestinationTopc"]) {
                properties["destType"] = "topic";
              }
              var destination = getOrAddDestination(properties);
              if (producerId && destination) {
                addLink(container.destinationLinkNode, destination, "destination");
                var producer = getOrAddNode("producer", producerId, properties, () => {
                  return {
                    typeLabel: "Producer (Dynamic)",
                    objectName: objectName,
                    jolokia: containerJolokia,
                    popup: {
                      title: "Producer (Dynamic): " + producerId,
                      content: "<p>client: " + (properties['ClientId'] || "") + "</p> " + brokerNameMarkup(properties['brokerName'])
                    }
                  };
                });
                addLink(producer, destination, "producer");
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

    function configureDestinationProperties(properties) {
      renameTypeProperty(properties);
      var destinationType = properties.destinationType || "Queue";
      var typeName = destinationType.toLowerCase();
      properties.isQueue = !typeName.startsWith("t");
      properties['destType'] = typeName;
    }
  }
}