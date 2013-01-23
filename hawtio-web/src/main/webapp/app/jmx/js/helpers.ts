module Jmx {

  var attributesToolBars = {};

  /**
   * Registers a toolbar template for the given plugin name, jmxDomain.
   *
   * @param pluginName used so that we can later on remove this function when the plugin is removed
   * @param jmxDomain the JMX domain to avoid having to evaluate too many functions on each selection
   * @param fn the function used to decide which attributes tool bar should be used for the given select
   */
  export function addAttributeToolBar(pluginName: string, jmxDomain: string, fn: (NodeSelection) => string) {
    var array = attributesToolBars[jmxDomain];
    if (!array) {
      array = [];
      attributesToolBars[jmxDomain] = array;
    }
    array.push(fn);
  }

  /**
   * Try find a custom toolbar HTML template for the given selection or returns the default value
   */
  export function getAttributeToolBar(node: NodeSelection, defaultValue: string = "app/jmx/html/attributesToolBar.html") {
    var answer = null;
    var jmxDomain = (node) ? node.domain : null;
    if (jmxDomain) {
      var array = attributesToolBars[jmxDomain];
      if (array) {
        for (var idx in array) {
          var fn = array[idx];
          answer = fn(node);
          if (answer) break;
        }
      }
    }
    return (answer) ? answer : defaultValue;
  }


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
        if (!treeElement.dynatree("getActiveNode")) {
          // lets expand the first node
          var root = treeElement.dynatree("getRoot");
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

  export function getUniqueTypeNames(children) {
    var typeNameMap = {};
    angular.forEach(children, (mbean) => {
      var typeName = mbean.typeName;
      if (typeName) {
        typeNameMap[typeName] = mbean;
      }
    });
    // only query if all the typenames are the same
    var typeNames = Object.keys(typeNameMap);
    return typeNames;
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