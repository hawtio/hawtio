module Wiki {
  export function CamelCanvasController($scope, $element, workspace:Workspace, jolokia) {
    $scope.selectedFolder = null;
    $scope.addDialog = new Core.Dialog();
    $scope.propertiesDialog = new Core.Dialog();

    $scope.$watch("camelContextTree", () => {
      var tree = $scope.camelContextTree;
      $scope.rootFolder = tree;
      // now we've got cid values in the tree and DOM, lets create an index so we can bind the DOM to the tree model
      $scope.folders = Camel.addFoldersToIndex($scope.rootFolder);

      var doc = Core.pathGet(tree, ["xmlDocument"]);
      if (doc) {
        $scope.doc = doc;
        $scope.routeIds = [];
        $(doc).find("route").each((idx, route) => {
          var id = route.getAttribute("id");
          if (id) {
            $scope.routeIds.push(id);
          }
        });
        onRouteSelectionChanged();
      }
    });

    $scope.addAndCloseDialog = () => {
      if ($scope.selectedPaletteNode) {
        addNewNode($scope.selectedPaletteNode["nodeModel"]);
      }
      $scope.addDialog.close();
    };

    $scope.removeNode = () => {
      if ($scope.selectedFolder) {
        $scope.selectedFolder.detach();
        $scope.selectedFolder = null;
        treeModified();
      }
    };

    $scope.doLayout = () => {
      $scope.drawnRouteId = null;
      onRouteSelectionChanged();
    };

    $scope.updatePropertiesAndCloseDialog = () => {
      var selectedFolder = $scope.selectedFolder;
      if (selectedFolder) {
        var routeXmlNode = selectedFolder["routeXmlNode"];
        if (routeXmlNode) {
          var nodeName = routeXmlNode.localName;
          var nodeSettings = Camel.getCamelSchema(nodeName);
          if (nodeSettings) {
            // update the title and tooltip etc
            Camel.updateRouteNodeLabelAndTooltip(selectedFolder, routeXmlNode, nodeSettings);
            // TODO update the div directly rather than a full layout?
          }
        }
        // TODO not sure we need this to be honest
        selectedFolder["camelNodeData"] = $scope.nodeData;
      }
      $scope.propertiesDialog.close();
      Core.$apply($scope);
      treeModified();
    };


    $scope.$watch("selectedRouteId", onRouteSelectionChanged);

    function addNewNode(nodeModel) {
      var parentFolder = $scope.selectedFolder || $scope.rootFolder;
      var key = nodeModel["_id"];
      var beforeNode = null;
      if (!key) {
        console.log("WARNING: no id for model " + JSON.stringify(nodeModel));
      } else {
        var treeNode = $scope.selectedFolder;
        if (key === "route") {
          // lets add to the root of the tree
          treeNode = $scope.rootFolder;
        } else {
          if (!treeNode) {
            // lets select the last route - and create a new route if need be
            var root = $scope.rootFolder;
            var children = root.children;
            if (!children || !children.length) {
              addNewNode(Camel.getCamelSchema("route"));
              children = root.children;
            }
            if (children && children.length) {
              treeNode = getRouteFolder($scope.rootFolder, $scope.selectedRouteId) || children[children.length - 1];
            } else {
              console.log("Could not add a new route to the empty tree!");
              return;
            }
          }

          // if the parent folder likes to act as a pipeline, then add
          // after the parent, rather than as a child
          var parentId = Camel.getFolderCamelNodeId(treeNode);
          if (!Camel.acceptOutput(parentId)) {
            treeNode = treeNode.parent || treeNode;
          }
        }
        if (treeNode) {
          var node = document.createElement(key);
          parentFolder = treeNode;
          var addedNode = Camel.addRouteChild(parentFolder, node);
        }
      }
      treeModified();
    }

    function treeModified() {
      // lets recreate the XML model from the update Folder tree
      var newDoc = Camel.generateXmlFromFolder($scope.rootFolder);
      var tree = Camel.loadCamelTree(newDoc, $scope.pageId);
      if (tree) {
        $scope.rootFolder = tree;
        $scope.doc = Core.pathGet(tree, ["xmlDocument"]);
      }
      $scope.doLayout();
      Core.$apply($scope);
    }


    function onRouteSelectionChanged() {
      if ($scope.doc) {
        if (!$scope.selectedRouteId && $scope.routeIds && $scope.routeIds.length) {
          $scope.selectedRouteId = $scope.routeIds[0];
        }
        if ($scope.selectedRouteId && $scope.selectedRouteId !== $scope.drawnRouteId) {
          var nodes = [];
          var links = [];
          Camel.loadRouteXmlNodes($scope, $scope.doc, $scope.selectedRouteId, nodes, links, getWidth());
          // now we've got cid values in the tree and DOM, lets create an index so we can bind the DOM to the tree model
          $scope.folders = Camel.addFoldersToIndex($scope.rootFolder);
          showGraph(nodes, links);
          $scope.drawnRouteId = $scope.selectedRouteId;
        }
      }
    }

    function showGraph(nodes, links) {
      var width = getWidth();
      var height = Camel.getCanvasHeight($($element));
      layoutGraph(nodes, links, width, height);
      return width;
    }

    function getNodeId(node) {
      if (angular.isNumber(node)) {
        var idx = node;
        node = $scope.nodeStates[idx];
        if (!node) {
          console.log("Cant find node at " + idx);
          return "node-" + idx;
        }
      }
      return node.cid || "node-" + node.id;
    }

    function layoutGraph(nodes, links, width, height) {
      var transitions = [];
      var states = Core.createGraphStates(nodes, links, transitions);
      $scope.nodeStates = states;

      var rootElement = $($element);
      var containerElement = rootElement.find(".canvas");
      if (!containerElement || !containerElement.length) containerElement = rootElement;
      try {
        jsPlumb.detachEveryConnection();
      } catch (e) {
        // ignore errors
      }
      try {
        jsPlumb.deleteEveryEndpoint();
      } catch (e) {
        // ignore errors
      }
      containerElement.find("div.component").remove();

      var endpointStyle:any[] = ["Dot", {radius: 2}];
      //var labelStyles: any[] = [ "Label", { label:"FOO", id:"label" }];
      var labelStyles:any[] = [ "Label" ];
      var arrowStyles:any[] = [ "Arrow", {
        location: 1,
        id: "arrow",
        length: 8,
        width: 8,
        foldback: 0.8
      } ];
      jsPlumb.importDefaults({
        Endpoint: endpointStyle,
        HoverPaintStyle: {strokeStyle: "#42a62c", lineWidth: 4 },
        ConnectionOverlays: [
          arrowStyles,
          labelStyles
        ]
      });

      var offset = containerElement.offset();
      var left = Core.pathGet(offset, ["left"]) || 0;
      var top = Core.pathGet(offset, ["top"]) || 0;

      angular.forEach(states, (node) => {
        var id = getNodeId(node);
        $("<div class='component window' id='" + id
                + "' title='" + node.tooltip + "'" +
          //+ " style='" + style + "'" +
                "><img class='nodeIcon' src='" + node.imageUrl + "'>" +
                "<span class='nodeText'>" + node.label + "</span></div>").appendTo(containerElement);

        var div = $("#" + id);
        var height = div.height();
        var width = div.width();
        if (height || width) {
          node.width = width;
          node.height = height;
        }
      });

      // Create the layout and get the graph
      dagre.layout()
              .nodeSep(50)
              .edgeSep(10)
              .rankSep(50)
              .nodes(states)
              .edges(transitions)
              .debugLevel(1)
              .run();

      angular.forEach(states, (node) => {
        var id = getNodeId(node);
        var dagre = node.dagre || node;
        var x = dagre.x || 0;
        var y = dagre.y || dagre["y:"] || 0;
        //if (left) x += left;
        if (top)  y += top;
        var div = $("#" + id);
        div.css({top: y, left: x});
      });

      var nodes = containerElement.find("div.component");
      var connectorStyle:any[] = [ "StateMachine", { curviness: 20 } ];
      nodes.each(function (i, e) {
        var endpoint = $(e);
        jsPlumb.makeSource(endpoint, {
          filter: "img.nodeIcon",
          anchor: "Continuous",
          connector: connectorStyle,
          connectorStyle: { strokeStyle: "#666", lineWidth: 2 },
          maxConnections: -1
        });
      });

      nodes.click(function () {
        var thisNode = $(this);
        var newFlag = !thisNode.hasClass("selected");
        nodes.toggleClass("selected", false);
        thisNode.toggleClass("selected", newFlag);
        var id = thisNode.attr("id");
        updateSelection(id);
        Core.$apply($scope);
      });

      nodes.dblclick(function () {
        var id = $(this).attr("id");
        updateSelection(id);
        if ($scope.selectedFolder) {
          $scope.propertiesDialog.open();
        }
        Core.$apply($scope);
      });

      jsPlumb.makeTarget(nodes, {
        dropOptions: { hoverClass: "dragHover" },
        anchor: "Continuous"
      });

      angular.forEach(links, (link) => {
        jsPlumb.connect({
          source: getNodeId(link.source),
          target: getNodeId(link.target)
        });
      });

      jsPlumb.draggable(nodes);
      /*
       TODO containment within the canvas div doesn't seem to work?

       jsPlumb.draggable(nodes, {
       containment: containerElement
       });
       */

      // double click on any connection
      jsPlumb.bind("dblclick", function (connection, originalEvent) {
        alert("double click on connection from " + connection.sourceId + " to " + connection.targetId);
      });

      // lets delete connections on click
      jsPlumb.bind("click", function (c) {
        jsPlumb.detach(c);
      });

      // context menu (right click) on any component.
      jsPlumb.bind("contextmenu", function (component, originalEvent) {
        alert("context menu on component " + component.id);
        originalEvent.preventDefault();
        return false;
      });

      return states;
    }

    /**
     * Updates the selection with the given folder or ID
     */
    function updateSelection(folderOrId) {
      var folder = null;
      if (angular.isString(folderOrId)) {
        var id = folderOrId;
        folder = (id && $scope.folders) ? $scope.folders[id] : null;
      } else {
        folder = folderOrId;
      }
      $scope.selectedFolder = folder;
      $scope.nodeXmlNode = null;
      $scope.propertiesTemplate = null;
      if (folder) {
        var nodeName = Camel.getFolderCamelNodeId(folder);
        $scope.nodeData = Camel.getRouteFolderJSON(folder);
        $scope.nodeDataChangedFields = {};
        $scope.nodeModel = Camel.getCamelSchema(nodeName);
        if ($scope.nodeModel) {
          $scope.propertiesTemplate = "app/wiki/html/camelPropertiesEdit.html";
        }
      }
    }

    function getWidth() {
      var canvasDiv = $($element);
      return canvasDiv.width();
    }

    function getRouteFolder(tree, routeId) {
      var answer = null;
      if (tree) {
        angular.forEach(tree.children, (route) => {
          var xmlNode = route["routeXmlNode"];
          if (xmlNode && !answer) {
            var id = xmlNode.getAttribute("id");
            if (id === routeId) {
              answer = route;
            }
          }
        });
      }
      return answer;
    }

    /*
     if (jsPlumb) {
     jsPlumb.bind("ready", setup);
     }

     function setup() {
     $scope.jsPlumbSetup = true;
     }
     */
  }
}