module Fabric {

  export function FabricBrokerDiagramController($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache) {

    Fabric.initScope($scope, $location, jolokia, workspace);

    var graphBuilder = new ForceGraph.GraphBuilder();

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

        var brokers = response.value;

        $scope.groups = [];

        var containersToDelete = $scope.activeContainers || {};
        $scope.activeContainers = {};

        angular.forEach(brokers, (brokerStatus) => {
          // only query master brokers which are provisioned correctly
          brokerStatus.validContainer = brokerStatus.alive && brokerStatus.master && brokerStatus.provisionStatus === "success";

          log.info("Broker status: " + angular.toJson(brokerStatus, true));

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
                  graphBuilder.addNode(node);
                }
              }
            }
            return node;
          }

          function addLink(object1, object2, linkType) {
            if (object1 && object2) {
              var id1 = object1.id;
              var id2 = object2.id;
              if (id1 && id2) {
                graphBuilder.addLink(id1, id2, linkType);
              }
            }
          }

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
              popup: {
                title: "Broker Group: " + groupId,
                content: "<p>" + groupId + "</p>"
              }
            };
          });

          var profile = getOrAddNode("profile", profileId, brokerStatus, () => {
            return {
              popup: {
                title: "Profile: " + profileId,
                content: "<p>" + profileId + "</p>"
              }
            };
          });

          var broker = getOrAddNode("broker", brokerId, brokerStatus, () => {
            var master = brokerStatus.master;
            return {
              type: master ? "brokerMaster" : "broker",
              popup: {
                title: (master ? "Master" : "Slave") + " Broker: " + brokerId,
                content: "<p>" + brokerId + "</p>"
              }
            };
          });

          // TODO do we need to create a physical broker node per container and logical broker maybe?
          var container = getOrAddNode("container", containerId, brokerStatus, () => {
            return {
              containerId: containerId,
              popup: {
                title: "Container: " + containerId,
                content: "<p>" + containerId + " version: " + versionId + "</p>"
              }
            };
          });


          if (container && container.validContainer) {
            var key = container.containerId;
            $scope.activeContainers[key] = container;
            delete containersToDelete[key];
          }

          // add the links...
          addLink(group, profile, "group");
          addLink(profile, broker, "broker");
          addLink(broker, container, "container");

          // TODO delete any nodes from dead containers in containersToDelete


          angular.forEach($scope.activeContainers, (container, id) => {
            function onContainerJolokia(containerJolokia) {
              if (containerJolokia) {
                container.jolokia = containerJolokia;

                function configureDestinationProperties(properties) {
                  var destinationType = properties.destinationType || "Queue";
                  var typeName = destinationType.toLowerCase();
                  properties.isQueue = !typeName.startsWith("t");
                  properties['type'] = typeName;
                }

                function getOrAddDestination(properties) {
                  var typeName = properties['type'];
                  var destinationName = properties.destinationName;
                  return getOrAddNode(typeName, destinationName, properties, () => {
                    return {
                      popup: {
                        title: (properties.destinationType || "Queue") + ": " + destinationName,
                        content: "<p>" + destinationName + " broker: " + (properties.brokerName || "") + "</p>"
                      }
                    };
                  });
                }


                // now lets query all the connections/consumers etc
                containerJolokia.search("org.apache.activemq:endpoint=Consumer,*", onSuccess((response) => {
                  angular.forEach(response, (objectName) => {
                    //log.info("Got consumer: " + objectName + " on container: " + id);
                    var details = Core.parseMBean(objectName);
                    if (details) {
                      var properties = details['attributes'];
                      if (properties) {
                        log.info("Got consumer properties: " + angular.toJson(properties, true) + " on container: " + id);

                        configureDestinationProperties(properties);
                        var consumerId = properties.consumerId;
                        if (consumerId) {
                          var destination = getOrAddDestination(properties);
                          addLink(container, destination, "destination");
                          var consumer = getOrAddNode("consumer", consumerId, properties, () => {
                            return {
                              popup: {
                                title: "Consumer: " + consumerId,
                                content: "<p>" + consumerId + " client: " + (properties.clientId || "") + " broker: " + (properties.brokerName || "") + "</p>"
                              }
                            };
                          });
                          addLink(destination, consumer, "consumer");
                        }
                      }
                    }
                  });
                  $scope.graph = graphBuilder.buildGraph();
                  Core.$apply($scope);
                }));
              }
            }

            var containerJolokia = container.jolokia;
            if (containerJolokia) {
              onContainerJolokia(containerJolokia);
            } else {
              Fabric.containerJolokia(jolokia, id, onContainerJolokia);
            }
          })
        });

        $scope.graph = graphBuilder.buildGraph();
        Core.$apply($scope);
      }
    }
  }
}