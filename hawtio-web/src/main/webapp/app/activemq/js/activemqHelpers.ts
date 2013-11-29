module ActiveMQ {

  export var log:Logging.Logger = Logger.get("activemq");

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
      var answer = null
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

}
