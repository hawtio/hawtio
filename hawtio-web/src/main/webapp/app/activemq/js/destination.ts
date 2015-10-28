/// <reference path="activemqPlugin.ts"/>
module ActiveMQ {
  _module.controller("ActiveMQ.DestinationController", ["$scope", "workspace", "jolokia", "localStorage", ($scope, workspace:Workspace, jolokia, localStorage) => {

    var amqJmxDomain = localStorage['activemqJmxDomain'] || "org.apache.activemq";

    $scope.workspace = workspace;
    $scope.message = "";
    $scope.queueType = 'true';

    $scope.deleteDialog = false;
    $scope.purgeDialog = false;

    updateQueueType();

    function updateQueueType() {
      $scope.destinationTypeName = $scope.queueType ? "Queue" : "Topic";
    }

    $scope.$watch('queueType', function () {
      updateQueueType();
    });

    $scope.$watch('workspace.selection', function () {
      workspace.moveIfViewInvalid();
    });

    function operationSuccess() {
      $scope.destinationName = "";
      $scope.workspace.operationCounter += 1;
      Core.$apply($scope);
      Core.notification("success", $scope.message);
      $scope.workspace.loadTree();
    }

    function deleteSuccess() {
      // lets set the selection to the parent
      workspace.removeAndSelectParentNode();
      $scope.workspace.operationCounter += 1;
      Core.$apply($scope);
      Core.notification("success", $scope.message);
      $scope.workspace.loadTree();
    }

    function getBrokerMBean(jolokia) {
      var mbean = null;
      var selection = workspace.selection;
      if (selection && isBroker(workspace, amqJmxDomain) && selection.objectName) {
        return selection.objectName;
      }
      var folderNames = selection.folderNames;
      //if (selection && jolokia && folderNames && folderNames.length > 1) {
      var parent = selection ? selection.parent : null;
      if (selection && parent && jolokia && folderNames && folderNames.length > 1) {
        mbean = parent.objectName;

        // we might be a destination, so lets try one more parent
        if (!mbean && parent) {
          mbean = parent.parent.objectName;
        }
        if (!mbean) {
          mbean = "" + folderNames[0] + ":BrokerName=" + folderNames[1] + ",Type=Broker";
        }
      }
      return mbean;
    }

    $scope.createDestination = (name, isQueue) => {
      var mbean = getBrokerMBean(jolokia);
      if (mbean) {
        var operation;
        if (isQueue) {
          operation = "addQueue(java.lang.String)"
          $scope.message = "Created queue " + Core.escapeHtml(name);
        } else {
          operation = "addTopic(java.lang.String)";
          $scope.message = "Created topic " + Core.escapeHtml(name);
        }
        if (mbean) {
          jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
        } else {
          Core.notification("error", "Could not find the Broker MBean!");
        }
      }
    };

    $scope.deleteDestination = () => {
      var mbean = getBrokerMBean(jolokia);
      var selection = workspace.selection;
      var entries = selection.entries;
      if (mbean && selection && jolokia && entries) {
        var domain = selection.domain;
        var name = entries["Destination"] || entries["destinationName"] || selection.title;
        name = name.unescapeHTML();
        var isQueue = "Topic" !== (entries["Type"] || entries["destinationType"]);
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
    };

    $scope.purgeDestination = () => {
      var mbean = workspace.getSelectedMBeanName();
      var selection = workspace.selection;
      var entries = selection.entries;
      if (mbean && selection && jolokia && entries) {
        var name = entries["Destination"] || entries["destinationName"] || selection.title;
        name = name.unescapeHTML();
        var operation = "purge()";
        $scope.message = "Purged queue " + name;
        jolokia.execute(mbean, operation, onSuccess(operationSuccess));
      }
    };

    $scope.name = () => {
      var selection = workspace.selection;
      if (selection) {
        return selection.title;
      }
      return null;
    }
  }]);
}
