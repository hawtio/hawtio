function DestinationController($scope, $location, workspace:Workspace) {
  $scope.workspace = workspace;

  $scope.$watch('workspace.selection', function () {
    workspace.moveIfViewInvalid();
  });

  function operationSuccess() {
    $scope.destinationName = "";
    $scope.workspace.operationCounter += 1;
    $scope.$apply();
  }

  function deleteSuccess() {
    // lets set the selection to the parent
    if (workspace.selection) {
      var parent = workspace.selection.parent;
      if (parent) {
        $scope.workspace.selection = parent;
        updateSelectionNode($location, parent);
      }
    }
    $scope.workspace.operationCounter += 1;
    $scope.$apply();
  }

  $scope.createDestination = (name, isQueue) => {
    var jolokia = workspace.jolokia;
    var selection = workspace.selection;
    var folderNames = selection.folderNames;
    if (selection && jolokia && folderNames && folderNames.length > 1) {
      var mbean = "" + folderNames[0] + ":BrokerName=" + folderNames[1] + ",Type=Broker";
      console.log("Creating queue " + isQueue + " of name: " + name + " on mbean");
      var operation;
      if (isQueue) {
        operation = "addQueue(java.lang.String)"
      } else {
        operation = "addTopic(java.lang.String)";
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
        console.log("Deleting queue " + isQueue + " of name: " + name + " on mbean");
        var operation;
        if (isQueue) {
          operation = "removeQueue(java.lang.String)"
        } else {
          operation = "removeTopic(java.lang.String)";
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
