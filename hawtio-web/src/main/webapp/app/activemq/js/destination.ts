function DestinationController($scope, $location, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.message = "";

  $scope.$watch('workspace.selection', function () {
    workspace.moveIfViewInvalid();
  });

  function operationSuccess() {
    $scope.destinationName = "";
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

  $scope.createDestination = (name, isQueue) => {
    var jolokia = workspace.jolokia;
    var selection = workspace.selection;
    var folderNames = selection.folderNames;
    if (selection && jolokia && folderNames && folderNames.length > 1) {
      var mbean = "" + folderNames[0] + ":BrokerName=" + folderNames[1] + ",Type=Broker";
      var operation;
      if (isQueue) {
        operation = "addQueue(java.lang.String)"
        $scope.message = "Created queue " + name;
      } else {
        operation = "addTopic(java.lang.String)";
        $scope.message = "Created topic " + name;
      }
      jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
    }
  };

  $scope.deleteDestination = () => {
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
        var operation;
        if (isQueue) {
          operation = "removeQueue(java.lang.String)"
          $scope.message = "Deleted queue " + name;
        } else {
          operation = "removeTopic(java.lang.String)";
          $scope.message = "Deleted topic " + name;
        }
        jolokia.execute(mbean, operation, name, onSuccess(deleteSuccess));
      }
    }
  };

  $scope.name = () => {
    var selection = workspace.selection;
    if (selection) {
      return selection.title;
    }
    return null;
  }
}
