module Jmx {

  export function updateTreeSelectionFromURL($location, treeElement, activateIfNoneSelected = false) {
    var dtree = treeElement.dynatree("getTree");
    if (dtree) {
      var node = null;
      var key = $location.search()['nid'];
      if (key) {
        try {
          node = dtree.activateKey(key);
        } catch (e) {
          // tree not visible we suspect!
        }
      }
      if (node) {
        node.expand(true);
      } else {
        if (!dtree.getActiveNode()) {
          // lets expand the first node
          var root = dtree.getRoot();
          var children = root ? root.getChildren() : null;
          if (children && children.length) {
            var first = children[0];
            first.expand(true);
            if (activateIfNoneSelected) {
              first.activate();
            }
          }
        }
      }
    }
  }

  export function enableTree($scope, $location: ng.ILocationService, workspace: Workspace, treeElement, children, redraw = false) {
    //$scope.workspace = workspace;

    if (treeElement.length) {
      treeElement.dynatree({
        /**
         * The event handler called when a different node in the tree is selected
         */
        onActivate: function (node:DynaTreeNode) {
          var data = node.data;
          //$scope.select(data);
          workspace.updateSelectionNode(data);
          $scope.$apply();
        },
        onClick: function (node:DynaTreeNode, event:Event) {
          if (event["metaKey"]) {
            event.preventDefault();
            var url = $location.absUrl();
            if (node && node.data) {
              var key = node.data["key"];
              if (key) {
                var hash = $location.search();
                hash["nid"] = key;

                // TODO this could maybe be a generic helper function?
                // lets trim after the ?
                var idx = url.indexOf('?');
                if (idx <= 0) {
                  url += "?";
                } else {
                  url = url.substring(0, idx + 1);
                }
                url += $.param(hash);
              }
            }
            window.open(url, '_blank');
            window.focus();
            return false;
          }
          return true;
        },
        persist: false,
        debugLevel: 0,
        //children: $scope.workspace.tree.children
        children: children
      });

      if (redraw) {
        treeElement.dynatree("getTree").reload();
      }
    }
  }
}