module Camel {

  export function TreeController($scope, $location: ng.ILocationService, workspace:Workspace) {
    $scope.$watch('workspace.tree', function () {
      if (workspace.moveIfViewInvalid()) return;

      // lets update the camel tree...

      console.log("Updating the camel tree");
      var children = [];

      // lets pull out each context

      var tree = workspace.tree;
      if (tree) {
        var folder = tree.get("org.apache.camel");
        if (folder) {
          children = folder.children;
        }

        var treeElement = $("#cameltree");
        Jmx.enableTree($scope, $location, workspace, treeElement, children);

        Jmx.updateTreeSelectionFromURL($location, treeElement);
      }
    });
  }
}