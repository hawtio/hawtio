module ActiveMQ {

  export var log:Logging.Logger = Logger.get("activemq");
  export var jmxDomain = 'org.apache.activemq';

  function findFolder(node, titles:string[], ascend:boolean): NodeSelection {
    if (!node) {
      return null;
    }
    var answer: NodeSelection = null;
    angular.forEach(titles, (title) => {
      if (node.title === title) {
        answer = node;
      }
    });
    if (answer === null) {
      if (ascend) {
        var parent = node.parent;
        if (parent) {
          answer = findFolder(parent, titles, ascend);
        }
      } else {
        // retrieves only one level down for children
        angular.forEach(node.children, (child) => {
          angular.forEach(titles, (title) => {
            if (child.title === title) {
              answer = child;
            }
          });
        });
      }
    }
    return answer;
  }

  export function getSelectionQueuesFolder(workspace:Workspace, ascend:boolean): NodeSelection {
    var selection = workspace.selection;
    if (selection) {
      return findFolder(selection, ["Queues", "Queue"], ascend);
    }
    return null;
  }

  export function retrieveQueueNames(workspace:Workspace, ascend:boolean): string[] {
    var queuesFolder = getSelectionQueuesFolder(workspace, ascend);
    if (queuesFolder) {
      return queuesFolder.children.map(n => n.title);
    }
    return [];
  }

  export function getSelectionTopicsFolder(workspace:Workspace, ascend:boolean): NodeSelection {
    var selection = workspace.selection;
    if (selection) {
      return findFolder(selection, ["Topics", "Topic"], ascend);
    }
    return null;
  }

  export function retrieveTopicNames(workspace:Workspace, ascend:boolean): string[] {
    var topicsFolder = getSelectionTopicsFolder(workspace, ascend);
    if (topicsFolder) {
      return topicsFolder.children.map(n => n.title);
    }
    return [];
  }

  /**
   * Sets $scope.row to currently selected JMS message.
   * Used in:
   *  - activemq/js/browse.ts
   *  - camel/js/browseEndpoint.ts
   *
   * TODO: remove $scope argument and operate directly on other variables. but it's too much side effects here...
   *
   * @param message
   * @param key unique key inside message that distinguishes between values
   * @param $scope
   */
  export function selectCurrentMessage(message:any, key:string, $scope) {
    // clicking on message's link would interfere with messages selected with checkboxes
    $scope.gridOptions.selectAll(false);
    var idx = Core.pathGet(message, ["rowIndex"]);
    var jmsMessageID = Core.pathGet(message, ["entity", key]);
    $scope.rowIndex = idx;
    var selected = $scope.gridOptions.selectedItems;
    selected.splice(0, selected.length);
    if (idx >= 0 && idx < $scope.messages.length) {
      $scope.row = $scope.messages.find((msg) => msg[key] === jmsMessageID);
      if ($scope.row) {
        selected.push($scope.row);
      }
    } else {
      $scope.row = null;
    }
  }

  /**
   * - Adds functions needed for message browsing with details
   * - Adds a watch to deselect all rows after closing the slideout with message details
   * TODO: export these functions too?
   *
   * @param $scope
   */
  export function decorate($scope) {
    $scope.selectRowIndex = (idx) => {
      $scope.rowIndex = idx;
      var selected = $scope.gridOptions.selectedItems;
      selected.splice(0, selected.length);
      if (idx >= 0 && idx < $scope.messages.length) {
        $scope.row = $scope.messages[idx];
        if ($scope.row) {
          selected.push($scope.row);
        }
      } else {
        $scope.row = null;
      }
    };

    $scope.$watch("showMessageDetails", () => {
      if (!$scope.showMessageDetails) {
        $scope.row = null;
        $scope.gridOptions.selectedItems.splice(0, $scope.gridOptions.selectedItems.length);
      }
    });
  }

  export function getBrokerMBean(workspace:Workspace, jolokia, jmxDomain:string) {
    var mbean = null;
    var selection = workspace.selection;
    if (selection && isBroker(workspace, jmxDomain) && selection.objectName) {
      return selection.objectName;
    }
    var folderNames = selection.folderNames;
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
  };

}
