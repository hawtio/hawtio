function EndpointController($scope, workspace:Workspace) {
  $scope.workspace = workspace;

  $scope.$watch('workspace.selection', function () {
    workspace.moveIfViewInvalid();
  });

  function operationSuccess() {
    $scope.endpointName = "";
    $scope.workspace.operationCounter += 1;
    $scope.$apply();
  }

  $scope.createEndpoint = (name) => {
    var jolokia = workspace.jolokia;
    if (jolokia) {
      var mbean = getSelectionCamelContextMBean(workspace);
      if (mbean) {
        console.log("Creating endpoint: " + name + " on mbean " + mbean);
        var operation = "createEndpoint(java.lang.String)";
        jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
      } else {
        console.log("Can't find the CamelContext MBean!");
      }
    }
  };

  $scope.deleteEndpoint = () => {
    var jolokia = workspace.jolokia;
    var selection = workspace.selection;
    var entries = selection.entries;
    if (selection && jolokia && entries) {
      var domain = selection.domain;
      var brokerName = entries["BrokerName"];
      var name = entries["Destination"];
      var isQueue = "Topic" !== entries["Type"];
      if (domain && brokerName) {
        var mbean = "" + domain + ":BrokerName=" + brokerName + ",Type=Broker";
        console.log("Deleting queue " + isQueue + " of name: " + name + " on mbean");
        var operation = "removeEndpoint(java.lang.String)";
        jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
      }
    }
  };
}
