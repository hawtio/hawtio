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

        function getOrAddNode(kind:string, id, createFn) {
          var nodeId = "";
          if (id) {
            nodeId = kind + "_" + id;
            var node = graphBuilder.getNode(nodeId);
            if (!node) {
              node = createFn();
              node['id'] = nodeId;
              node['type'] = kind;
              if (!node['name']) {
                node['name'] = id;
              }
              if (node) {
                graphBuilder.addNode(node);
              }
            }
          }
          return nodeId;
        }

        function addLink(id1, id2, linkType) {
          if (id1 && id2) {
            graphBuilder.addLink(id1, id2, linkType);
          }
        }

        angular.forEach(brokers, (brokerStatus) => {
          var groupId = brokerStatus.group;
          var profileId = brokerStatus.profile;
          var brokerId = brokerStatus.brokerName;
          var containerId = brokerStatus.container;
          var versionId = brokerStatus.version || "1.0";

          var groupNodeId = getOrAddNode("group", groupId, () => {
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

          var profileNodeId = getOrAddNode("profile", profileId, () => {
            return {
              popup: {
                title: "Profile: " + profileId,
                content: "<p>" + profileId + "</p>"
              }
            };
          });

          var brokerNodeId = getOrAddNode("broker", brokerId, () => {
            return {
              popup: {
                title: "Broker: " + brokerId,
                content: "<p>" + brokerId + "</p>"
              }
            };
          });

          var containerNodeId = getOrAddNode("container", containerId, () => {
            return {
              popup: {
                title: "Container: " + containerId,
                content: "<p>" + containerId + " version: " + versionId + "</p>"
              }
            };
          });

          // add the links...
          addLink(groupNodeId, profileNodeId, "group");
          addLink(profileNodeId, brokerNodeId, "broker");
          addLink(brokerNodeId, containerNodeId, "container");
        });

        $scope.graph = graphBuilder.buildGraph();
        Core.$apply($scope);
      }
    }
  }
}