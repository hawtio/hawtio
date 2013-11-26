/**
 * @module Tree
 * @main Tree
 */
module Tree {
  var pluginName = 'tree';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          directive('hawtioTree',function (workspace, $timeout, $location, $filter, $compile) {
            // return the directive link function. (compile function not needed)
            return function (scope, element, attrs) {
              var tree = null;
              var data = null;
              var widget = null;
              var timeoutId = null;
              var onSelectFn = lookupFunction("onselect");
              var onDragStartFn = lookupFunction("ondragstart");
              var onDragEnterFn = lookupFunction("ondragenter");
              var onDropFn = lookupFunction("ondrop");

              function lookupFunction(attrName) {
                var answer = null;
                var fnName = attrs[attrName];
                if (fnName) {
                  answer = Core.pathGet(scope, fnName);
                  if (!angular.isFunction(answer)) {
                    answer = null;
                  }
                }
                return answer;
              }

              // watch the expression, and update the UI on change.
              var data = attrs.hawtioTree;
              var queryParam = data;

              scope.$watch(data, onWidgetDataChange);

              // lets add a separate event so we can force updates
              // if we find cases where the delta logic doesn't work
              scope.$on("hawtio.tree." + data, function (args) {
                var value = Core.pathGet(scope, data);
                onWidgetDataChange(value);
              });

              // listen on DOM destroy (removal) event, and cancel the next UI update
              // to prevent updating ofter the DOM element was removed.
              element.bind('$destroy', function () {
                $timeout.cancel(timeoutId);
              });

              updateLater(); // kick off the UI update process.

              // used to update the UI
              function updateWidget() {
                // console.log("updating the grid!!");
                Core.$applyNowOrLater(scope);
              }

              function onWidgetDataChange(value) {
                tree = value;
                if (tree && !widget) {
                  // lets find a child table element
                  // or lets add one if there's not one already
                  var treeElement = $(element);
                  var children = Core.asArray(tree);
                  var hideRoot = attrs["hideroot"];
                  if ("true" === hideRoot) {
                    children = tree.children;
                  }
                  var config = {
                    clickFolderMode: 3, // activate and expand

                    /*
                     * The event handler called when a different node in the tree is selected
                     */
                    onActivate: function (node:DynaTreeNode) {
                      var data = node.data;
                      if (onSelectFn) {
                        onSelectFn(data, node);
                      } else {
                        workspace.updateSelectionNode(data);
                      }
                      Core.$apply(scope);
                    },
                    /*
                     onLazyRead: function(treeNode) {
                     var folder = treeNode.data;
                     var plugin = null;
                     if (folder) {
                     plugin = Jmx.findLazyLoadingFunction(workspace, folder);
                     }
                     if (plugin) {
                     console.log("Lazy loading folder " + folder.title);
                     var oldChildren = folder.childen;
                     plugin(workspace, folder, () => {
                     treeNode.setLazyNodeStatus(DTNodeStatus_Ok);
                     var newChildren = folder.children;
                     if (newChildren !== oldChildren) {
                     treeNode.removeChildren();
                     angular.forEach(newChildren, newChild => {
                     treeNode.addChild(newChild);
                     });
                     }
                     });
                     } else {
                     treeNode.setLazyNodeStatus(DTNodeStatus_Ok);
                     }
                     },
                     */
                    onClick: function (node:DynaTreeNode, event:Event) {
                      if (event["metaKey"]) {
                        event.preventDefault();
                        var url = $location.absUrl();
                        if (node && node.data) {
                          var key = node.data["key"];
                          if (key) {
                            var hash = $location.search();
                            hash[queryParam] = key;

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
                    children: children,
                    dnd: {
                      onDragStart: onDragStartFn ? onDragStartFn : function (node) {
                        /* This function MUST be defined to enable dragging for the tree.
                         *  Return false to cancel dragging of node.
                         */
                        console.log("onDragStart!");
                        return true;
                      },
                      onDragEnter: onDragEnterFn ? onDragEnterFn : function (node, sourceNode) {
                        console.log("onDragEnter!");
                        return true;
                      },
                      onDrop: onDropFn ? onDropFn : function (node, sourceNode, hitMode) {
                        console.log("onDrop!");
                        /* This function MUST be defined to enable dropping of items on
                         *  the tree.
                         */
                        sourceNode.move(node, hitMode);
                        return true;
                      }
                    }
                  };
                  if (!onDropFn && !onDragEnterFn && !onDragStartFn) {
                    delete config["dnd"];
                  }
                  widget = treeElement.dynatree(config);

                  var activatedNode = false;
                  var activateNodeName = attrs["activatenodes"];
                  if (activateNodeName) {
                    var values = scope[activateNodeName];
                    var tree = treeElement.dynatree("getTree");
                    if (values && tree) {
                      angular.forEach(Core.asArray(values), (value) => {
                        //tree.selectKey(value, true);
                        tree.activateKey(value);
                        activatedNode = true;
                      });
                    }
                  }
                  var root = treeElement.dynatree("getRoot");
                  if (root) {
                    var onRootName = attrs["onroot"];
                    if (onRootName) {
                      var fn = scope[onRootName];
                      if (fn) {
                        fn(root);
                      }
                    }
                    // select and activate first child if we have not activated any others
                    if (!activatedNode) {
                      var children = root.getChildren();
                      if (children && children.length) {
                        var child = children[0];
                        child.expand(true);
                        child.activate(true);
                      }
                    }
                  }
                }
                updateWidget();
              }

              // schedule update in one second
              function updateLater() {
                // save the timeoutId for canceling
                timeoutId = $timeout(function () {
                  updateWidget(); // update DOM
                }, 300);
              }
            }
          }).
          run(function (helpRegistry) {
            helpRegistry.addDevDoc(pluginName, 'app/tree/doc/developer.md');
          });

  hawtioPluginLoader.addModule(pluginName);
}
