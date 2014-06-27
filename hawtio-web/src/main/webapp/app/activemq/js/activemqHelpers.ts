module ActiveMQ {

  export var log:Logging.Logger = Logger.get("activemq");
  export var jmxDomain = 'org.apache.activemq';

  export function getSelectionQueuesFolder(workspace) {
    function findQueuesFolder(node) {
      if (node) {
        if (node.title === "Queues" || node.title === "Queue") {
          return node;
        }
        var parent = node.parent;
        if (parent) {
          return findQueuesFolder(parent);
        }
      }
      return null;
    }

    var selection = workspace.selection;
    if (selection) {
      return findQueuesFolder(selection);
    }
    return null;
  }

  export function getSelectionTopicsFolder(workspace) {
    function findTopicsFolder(node) {
      var answer = null;
      if (node) {
        if (node.title === "Topics" || node.title === "Topic") {
          answer = node;
        }

        if (answer === null) {
          angular.forEach(node.children, (child) => {
              if (child.title === "Topics" || child.title === "Topic") {
                answer = child;
              }
          });
        }
      }
      return answer;
    }


    var selection = workspace.selection;
    if (selection) {
      return findTopicsFolder(selection);
    }
    return null;
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

}
