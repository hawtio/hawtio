module Fabric {

  export function ContainerController($scope, workspace:Workspace, $routeParams, jolokia) {
    var containerId = $routeParams.containerId || "root";

    $scope.getType = () => {
      if ($scope.row) {
        if ($scope.row.ensembleServer) {
          return "Fabric Server";
        } else if ($scope.row.managed) {
          return "Managed Container";
        } else {
          return "Unmanaged Container";
        }
      }
      return "";
    }

    $scope.hasServices = () => {
      $scope.getServices().length > 0;
    }

    $scope.getServices = () => {
      var answer = [];
      if ($scope.row) {

        $scope.row.jmxDomains.forEach((domain) => {
          if (domain === "org.apache.activemq") {
            answer.push({
              title: "Apache ActiveMQ",
              type: "img",
              src: "app/fabric/img/message_broker.png"
            });
          }
          if (domain === "org.apache.camel") {
            answer.push({
              title: "Apache Camel",
              type: "img",
              src: "app/fabric/img/camel.png"
            });
          }
          if (domain === "org.fusesource.fabric") {
            answer.push({
              title: "Fuse Fabric",
              type: "img",
              src: "app/fabric/img/fabric.png"
            });
          }
          if (domain === "hawtio") {
            answer.push({
              title: "hawtio",
              type: "img",
              src: "app/fabric/img/hawtio.png"
            });
          }
          if (domain === "org.apache.karaf") {
            answer.push({
              title: "Apache Karaf",
              type: "icon",
              src: "icon-beaker"
            })
          }
          if (domain === "org.apache.zookeeper") {
            answer.push({
              title: "Apache Zookeeper",
              type: "icon",
              src: "icon-group"
            })
          }
        });
      }
      return answer;
    }

    jolokia.request(
            {type: 'exec', mbean: managerMBean,
              operation: 'getContainer(java.lang.String)',
              arguments: [containerId]},
            onSuccess(populateTable));


    function populateTable(response) {
      $scope.row = response.value;
      $scope.row.services = $scope.getServices();
      Fabric.defaultContainerValues(workspace, $scope, [$scope.row]);
      $scope.$apply();
    }
 }
}
