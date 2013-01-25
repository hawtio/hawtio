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
        var domainName = "Tomcat";
        var folder = tree.get(domainName);
        if (folder) {
          children = folder.children;
        }
/*
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
*/
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