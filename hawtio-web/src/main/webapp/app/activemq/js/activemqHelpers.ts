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
}
