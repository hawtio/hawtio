module Tomcat {

  export function TreeController($scope, $location:ng.ILocationService, workspace:Workspace) {

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    $scope.$watch('workspace.tree', function () {
      console.log("workspace tree has changed, lets reload!!");

      if (workspace.moveIfViewInvalid()) return;

      var children = [];
      var tree = workspace.tree;
      if (tree) {
        var folder = tree.get("Tomcat");
        if (!folder) {
          folder = tree.get("Catalina");
        }
        if (folder) {
          children = folder.children;
        }
      }
      var treeElement = $("#tomcatTree");
      Jmx.enableTree($scope, $location, workspace, treeElement, children, true);

      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURL($location, $("#tomcatTree"), true);
    }
  }
}