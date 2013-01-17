module ActiveMQ {

  export function TreeController($scope, $location:ng.ILocationService, workspace:Workspace) {

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    $scope.$watch('workspace.tree', function () {
      if (workspace.moveIfViewInvalid()) return;

      var children = [];
      var tree = workspace.tree;
      if (tree) {
        var domainName = "org.apache.activemq";
        var folder = tree.get(domainName);
        if (folder) {
          children = folder.children;
        }
        var treeElement = $("#activemqtree");
        Jmx.enableTree($scope, $location, workspace, treeElement, children);
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
    });

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURL($location, $("#activemqtree"));
    }
  }
}