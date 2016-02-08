/**
 * @module OpenEJB
 */
/// <reference path="./openejbPlugin.ts"/>
module OpenEJB {

  _module.controller("OpenEJB.TreeController", ["$scope", "$location", "workspace", ($scope, $location:ng.ILocationService, workspace:Workspace) => {

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    $scope.$watch('workspace.tree', function () {
      if (workspace.moveIfViewInvalid()) return;

      var children = [];
      var tree = workspace.tree;
      if (tree) {
        var nodes = tree.children;
        angular.forEach(nodes, (node) => {
          var nodeChildren = node.children;
          if (node.title.startsWith("openejb") && nodeChildren) {
            children = children.concat(nodeChildren);
          }
        });
      }
      var treeElement = $("#openejbTree");
      Jmx.enableTree($scope, $location, workspace, treeElement, children, true);

      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURL($location, $("#openejbTree"), true);
    }
  }]);
}
