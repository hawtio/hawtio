module ActiveMQ {

  export function TreeController($scope, $location:ng.ILocationService, workspace:Workspace) {

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });


    $scope.$watch('workspace.tree', function () {
      reloadTree();
    });

    $scope.$on('jmxTreeUpdated', function () {
      reloadTree();
    });

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURL($location, $("#activemqtree"), true);
    }

    function reloadTree() {
      console.log("workspace tree has changed, lets reload the activemq tree");

      var children = [];
      var tree = workspace.tree;
      if (tree) {
        var domainName = "org.apache.activemq";
        var folder = tree.get(domainName);
        if (folder) {
          children = folder.children;
        }
        if (children.length) {
          var firstChild = children[0];
          // the children could be AMQ 5.7 style broker name folder with the actual MBean in the children
          // along with folders for the Queues etc...
          if (!firstChild.typeName && firstChild.children.length < 4) {
            // lets avoid the top level folder
            var answer = [];
            angular.forEach(children, (child) => {
              answer = answer.concat(child.children);
            });
            children = answer;
          }
        }
        var treeElement = $("#activemqtree");
        Jmx.enableTree($scope, $location, workspace, treeElement, children, true);
/*

        // lets select the first node if we have no selection
        var key = $location.search()['nid'];
        var node = children[0];
        if (!key && node) {
          key = node['key'];
          if (key) {
            var q = $location.search();
            q['nid'] = key;
            $location.search(q);
          }
        }
        if (!key) {
          updateSelectionFromURL();
        }
*/
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
      }
    }
  }
}