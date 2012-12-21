function EndpointController($scope, $location, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.message = "";

  $scope.$watch('workspace.selection', function () {
    workspace.moveIfViewInvalid();
  });

  function operationSuccess() {
    $scope.endpointName = "";
    $scope.workspace.operationCounter += 1;
    $scope.$apply();
    notification("success", $scope.message);
  }

  function deleteSuccess() {
    // lets set the selection to the parent
    if (workspace.selection) {
      var parent = workspace.selection.parent;
      if (parent) {
        $scope.workspace.updateSelectionNode(parent);
      }
    }
    $scope.workspace.operationCounter += 1;
    $scope.$apply();
    notification("success", $scope.message);
  }

  $scope.createEndpoint = (name) => {
    var jolokia = workspace.jolokia;
    if (jolokia) {
      var mbean = getSelectionCamelContextMBean(workspace);
      if (mbean) {
        $scope.message = "Creating endpoint " + name;
        var operation = "createEndpoint(java.lang.String)";
        jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
      } else {
        notification("error", "Could not find the CamelContext MBean!");
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
        $scope.message = "Deleting " + (isQueue ? "queue" :  "topic") + " " + name;
        var operation = "removeEndpoint(java.lang.String)";
        jolokia.execute(mbean, operation, name, onSuccess(deleteSuccess));
      }
    }
  };
}
