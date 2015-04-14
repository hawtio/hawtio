/// <reference path="activemqPlugin.ts"/>
/// <reference path="../../fabric/js/fabricHelpers.ts"/>
module ActiveMQ {

  _module.controller("ActiveMQ.BrokerDiagramController", ["$scope", "$compile", "$location", "localStorage", "jolokia", "workspace", "$routeParams", ($scope, $compile, $location, localStorage, jolokia, workspace, $routeParams) => {

    Fabric.initScope($scope, $location, jolokia, workspace);

    var isFmc = Fabric.isFMCContainer(workspace);
    $scope.isFmc = isFmc;

    if (isFmc) {
      $scope.version = $routeParams['versionId'];
      if ($scope.version == 'default-version') {
        $scope.version = Fabric.getDefaultVersionId(jolokia);
      }
      $scope.selectedVersion = { id: $scope.version };
    }

    $scope.selectedNode = null;

    var defaultFlags = {
      panel: true,
      popup: false,
      label: true,

      group: false,
      profile: false,
      slave: false,
      broker: isFmc,
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

    var redrawGraph = Core.throttled(doRedrawGraph, 1000);

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

    $scope.connectToBroker = () => {
      var selectedNode = $scope.selectedNode;
      if (selectedNode) {
        var container = selectedNode["brokerContainer"] || selectedNode;
        connectToBroker(container, selectedNode["brokerName"]);
      }
    };

    function connectToBroker(container, brokerName, postfix = null) {
      if (isFmc && container.jolokia !== jolokia) {
        Fabric.connectToBroker($scope, container, postfix);
      } else {
        var view = "/jmx/attributes?tab=activemq";
        if (!postfix) {
          if (brokerName) {
            // lets default to the broker view
            postfix = "nid=root-org.apache.activemq-Broker-" + brokerName;
          }
        }
        if (postfix) {
          view += "&" + postfix;
        }
        log.info("Opening view " + view);
        var path = Core.url("/#" + view);
        window.open(path, '_destination');
        window.focus();
        //$location.path(view);
      }
    }

    $scope.connectToDestination = () => {
      var selectedNode = $scope.selectedNode;
      if (selectedNode) {
        var container = selectedNode["brokerContainer"] || selectedNode;
        var brokerName = selectedNode["brokerName"];
        var destinationType = selectedNode["destinationType"] || selectedNode["typeLabel"];
        var destinationName = selectedNode["destinationName"];
        var postfix: string = null;
        if (brokerName && destinationType && destinationName) {
          postfix = "nid=root-org.apache.activemq-Broker-" + brokerName + "-" + destinationType + "-" + destinationName;
        }
        connectToBroker(container, brokerName, postfix);
      }
    };

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
        var brokerContainer = node.brokerContainer || {};
        var nodeJolokia = node.jolokia || brokerContainer.jolokia || jolokia;
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
          log.debug("reading ", mbean, " on remote container");
          $scope.unregisterFn = Core.register(nodeJolokia, $scope, {
            type: 'read', mbean: mbean
          }, onSuccess(renderNodeAttributes, {
             error: (response) => {
               // probably we've got a wrong mbean name?
               // so lets render at least
               renderNodeAttributes(dummyResponse);
               Core.defaultJolokiaErrorHandler(response);
             }
          }));
        } else {
          log.debug("no mbean or jolokia available, using dummy response");
          renderNodeAttributes(dummyResponse);
        }
      }
    });

    function getDestinationTypeName(attributes) {
      var prefix = attributes["DestinationTemporary"] ? "Temporary " : "";
      return prefix + (attributes["DestinationTopic"] ? "Topic" : "Queue");
    }

    var ignoreNodeAttributes = ["Broker", "BrokerId", "BrokerName", "Connection",
      "DestinationName", "DestinationQueue", "DestinationTemporary", "DestinationTopic",
    ];

    var ignoreNodeAttributesByType = {
      producer: ["Producer", "ProducerId"],
      queue: ["Name", "MessageGroups", "MessageGroupType", "Subscriptions"],
      topic: ["Name", "Subscriptions"],
      broker: ["DataDirectory", "DurableTopicSubscriptions", "DynamicDestinationProducers", "InactiveDurableToppicSubscribers"]
    };

    var brokerShowProperties = ["AverageMessageSize", "BrokerId", "JobSchedulerStorePercentUsage",
      "Slave", "MemoryPercentUsage", "StorePercentUsage", "TempPercentUsage"];
    var onlyShowAttributesByType = {
      broker: brokerShowProperties,
      brokerSlave: brokerShowProperties
    };

    function renderNodeAttributes(response) {
      var properties = [];
      if (response) {
        var value = response.value || {};
        $scope.selectedNodeAttributes = value;
        var selectedNode = $scope.selectedNode || {};
        var brokerContainer = selectedNode['brokerContainer'] || {};
        var nodeType = selectedNode["type"];
        var brokerName = selectedNode["brokerName"];
        var containerId = selectedNode["container"] || brokerContainer["container"];
        var group = selectedNode["group"] || brokerContainer["group"];
        var jolokiaUrl = selectedNode["jolokiaUrl"] || brokerContainer["jolokiaUrl"];
        var profile = selectedNode["profile"] || brokerContainer["profile"];
        var version = selectedNode["version"] || brokerContainer["version"];

        var isBroker = nodeType && nodeType.startsWith("broker");
        var ignoreKeys = ignoreNodeAttributes.concat(ignoreNodeAttributesByType[nodeType] || []);
        var onlyShowKeys = onlyShowAttributesByType[nodeType];

        angular.forEach(value, (v, k) => {
          if (onlyShowKeys ? onlyShowKeys.indexOf(k) >= 0: ignoreKeys.indexOf(k) < 0) {
            var formattedValue = Core.humanizeValueHtml(v);
            properties.push({key: Core.humanizeValue(k), value: formattedValue});
          }
        });
        properties = properties.sortBy("key");

        var brokerProperty: any = null;
        if (brokerName) {
          var brokerHtml = '<a target="broker" ng-click="connectToBroker()">' +
            '<img title="Apache ActiveMQ" src="img/icons/messagebroker.svg"> ' + brokerName +
            '</a>';
          if (version && profile) {
            var brokerLink = Fabric.brokerConfigLink(workspace, jolokia, localStorage, version, profile, brokerName);
            if (brokerLink) {
              brokerHtml += ' <a title="configuration settings" target="brokerConfig" href="' + brokerLink +
                '"><i class="icon-tasks"></i></a>';
            }
          }
          var html = $compile(brokerHtml)($scope);
          brokerProperty = {key: "Broker", value: html};
          if (!isBroker) {
            properties.splice(0, 0, brokerProperty);
          }
        }

        if (containerId) {
          //var containerModel = "selectedNode" + (selectedNode['brokerContainer'] ? ".brokerContainer" : "");
          properties.splice(0, 0, {key: "Container", value: $compile('<div fabric-container-link="' + selectedNode['container'] + '"></div>')($scope)});
        }

        var destinationName = value["DestinationName"] || selectedNode["destinationName"];
        if (destinationName && (nodeType !== "queue" && nodeType !== "topic")) {
          var destinationTypeName = getDestinationTypeName(value);
          var html = createDestinationLink(destinationName, destinationTypeName);
          properties.splice(0, 0, {key: destinationTypeName, value: html});
        }

        var typeLabel = selectedNode["typeLabel"];
        var name = selectedNode["name"] || selectedNode["id"] || selectedNode['objectName'];
        if (typeLabel) {
          var html = name;
          if (nodeType === "queue" || nodeType === "topic") {
            html = createDestinationLink(name, nodeType);
          }
          var typeProperty = {key: typeLabel, value: html};
          if (isBroker && brokerProperty) {
            typeProperty = brokerProperty;
          }
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
      return $compile('<a target="destination" title="' + destinationName + '" ng-click="connectToDestination()">' +
                                  //'<img title="View destination" src="img/icons/activemq/' + destinationType + '.png"> ' +
                                  destinationName +
                                  '</a>')($scope);
    }

    $scope.$watch("searchFilter", (newValue, oldValue) => {
      redrawGraph();
    });

    if (isFmc) {
      var unreg:() => void = null;

      $scope.$watch('selectedVersion.id', (newValue, oldValue) => {
        if (!Core.isBlank(newValue)) {
          if (unreg) {
            unreg();
          }
          unreg = <() => void>Core.register(jolokia, $scope, {type: 'exec', mbean: Fabric.mqManagerMBean, operation: "loadBrokerStatus(java.lang.String)", arguments: [ newValue ]}, onSuccess(onBrokerData));
        }
      });
    } else {
      // lets just use the current stuff from the workspace
      $scope.$watch('workspace.tree', function () {
        redrawGraph();
      });

      $scope.$on('jmxTreeUpdated', function () {
        redrawGraph();
      });
    }


    function onBrokerData(response) {
      if (response) {
        var responseJson = angular.toJson(response.value);
        if ($scope.responseJson === responseJson) {
          return;
        }

        $scope.responseJson = responseJson;

        $scope.brokers = response.value;
        doRedrawGraph();
      }
    }



    function redrawFabricBrokers() {
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
             url: "/hawtio/img/icons/osgi/bundle.png",
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

        var master = brokerStatus.master;
        var broker = getOrAddBroker(master, brokerId, groupId, containerId, container, brokerStatus);
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
      redrawActiveContainers();
    }

    function redrawLocalBroker() {
      var container = {
        jolokia: jolokia
      };
      var containerId = "local";
      $scope.activeContainers = {
        containerId: container
      };

      if ($scope.viewSettings.broker) {
        jolokia.search("org.apache.activemq:type=Broker,brokerName=*", onSuccess((response) => {
          angular.forEach(response, (objectName) => {
            var details = Core.parseMBean(objectName);
            if (details) {
              var properties = details['attributes'];
              log.info("Got broker: " + objectName + " on container: " + containerId + " properties: " + angular.toJson(properties, true));
              if (properties) {
                var master = true;
                var brokerId = properties["brokerName"] || "unknown";
                var groupId = "";
                var broker = getOrAddBroker(master, brokerId, groupId, containerId, container, properties);
              }
            }
          });
          redrawActiveContainers();
        }));
      } else {
        redrawActiveContainers();
      }
    }

    function redrawActiveContainers() {
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

    function doRedrawGraph() {
      graphBuilder = new ForceGraph.GraphBuilder();
      if (isFmc) {
        redrawFabricBrokers();
      } else {
        redrawLocalBroker();
      }
    }

    function brokerNameMarkup(brokerName) {
      return brokerName ? "<p></p>broker: " + brokerName + "</p>" : "";
    }

    function matchesDestinationName(destinationName, typeName) {
      if (destinationName) {
        var selection = workspace.selection;
        if (selection && selection.domain === ActiveMQ.jmxDomain) {
          var type = selection.entries["destinationType"];
          if (type) {
            if ((type === "Queue" && typeName === "topic") || (type === "Topic" && typeName === "queue")) {
              return false;
            }
          }
          var destName = selection.entries["destinationName"];
          if (destName) {
            if (destName !== destinationName) return false;
          }
        }
        log.info("selection: " + selection);
        // TODO if the current selection is a destination...
        return !$scope.searchFilter || destinationName.indexOf($scope.searchFilter) >= 0;
      }
      return false;
    }

    function onContainerJolokia(containerJolokia, container, id) {
      if (containerJolokia) {
        container.jolokia = containerJolokia;

        function getOrAddDestination(properties) {
          var typeName = properties.destType;
          var brokerName = properties.brokerName;
          var destinationName = properties.destinationName;
          if (!matchesDestinationName(destinationName, typeName)) {
            return null;
          }
          // should we be filtering this destination out
          var hideFlag = "topic" === typeName ? $scope.viewSettings.topic: $scope.viewSettings.queue;
          if (!hideFlag) {
            return null;
          }
          var destination = getOrAddNode(typeName, destinationName, properties, () => {
            var destinationTypeName = properties.destinationType || "Queue";
            var objectName = "";
            if (brokerName) {
              // lets ignore temp topic stuff as there's no mbean for these
              if (!destinationName.startsWith("ActiveMQ.Advisory.TempQueue_ActiveMQ.Advisory.TempTopic")) {
                objectName = "org.apache.activemq:type=Broker,brokerName=" + brokerName +
                  ",destinationType=" + destinationTypeName + ",destinationName=" + destinationName;
              }
            }
            var answer = {
              typeLabel: destinationTypeName,
              brokerContainer: container,
              objectName: objectName,
              jolokia: containerJolokia,
              popup: {
                title: destinationTypeName + ": " + destinationName,
                content: brokerNameMarkup(properties.brokerName)
              }
            };
            if (!brokerName) {
              containerJolokia.search("org.apache.activemq:destinationType=" + destinationTypeName
                + ",destinationName=" + destinationName +",*", onSuccess((response) => {
                log.info("Found destination mbean: " + response);
                if (response && response.length) {
                  answer.objectName = response[0];
                }
              }));
            }
            return answer;
          });
          if (destination && $scope.viewSettings.broker && brokerName) {
            addLinkIds(brokerNodeId(brokerName), destination["id"], "destination");
          }
          return destination;
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
                  addLinkIds(brokerNodeId(brokerId), brokerNodeId(remoteBrokerId), "network");
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
                          brokerContainer: container,
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
                          brokerContainer: container,
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
                    brokerContainer: container,
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

    function getOrAddBroker(master, brokerId, groupId, containerId, container, brokerStatus) {
      var broker = null;
      var brokerFlag = master ? $scope.viewSettings.broker : $scope.viewSettings.slave;
      if (brokerFlag) {
        broker = getOrAddNode("broker", brokerId + (master ? "" : ":slave"), brokerStatus, () => {
          return {
            type: master ? "broker" : "brokerSlave",
            typeLabel: master ? "Broker" : "Slave Broker",
            popup: {
              title: (master ? "Master" : "Slave") + " Broker: " + brokerId,
              content: "<p>Container: " + containerId + "</p> <p>Group: " + groupId + "</p>"
            }
          };
        });
        if (master) {
          if (!broker['objectName']) {
            // lets try guess the mbean name
            broker['objectName'] = "org.apache.activemq:type=Broker,brokerName=" + brokerId;
            log.info("Guessed broker mbean: " + broker['objectName']);
          }
          if (!broker['brokerContainer'] && container) {
            broker['brokerContainer'] = container;
          }
        }
      }
      return broker;
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

    function brokerNodeId(brokerId) {
      return brokerId ? "broker:" + brokerId : null;
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
  }]);
}
