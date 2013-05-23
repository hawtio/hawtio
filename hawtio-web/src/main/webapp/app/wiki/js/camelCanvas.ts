module Wiki {
  export function CamelCanvasController($scope, $element, workspace:Workspace, jolokia) {

    // START copied from CamelController - not sure why inheritence not working...
    $scope.canDelete = () => {
      return $scope.selectedFolder ? true : false;
    };
    // END copied from CamelController - not sure why inheritence not working...

    $scope.selectedFolder = null;

    $scope.$watch("camelContextTree", () => {
      var tree = $scope.camelContextTree;
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

    $scope.addDialog = new Core.Dialog();


    $scope.addAndCloseDialog = () => {
      if ($scope.selectedPaletteNode) {
        addNewNode($scope.selectedPaletteNode["nodeModel"]);
      }
      $scope.addDialog.close();
    };

    $scope.doLayout = () => {
      $scope.drawnRouteId = null;
      onRouteSelectionChanged();
    };

    $scope.$watch("selectedRouteId", onRouteSelectionChanged);

    function addNewNode(nodeModel) {
      console.log("Adding new node " + nodeModel);
      $scope.$parent.addNewNode(nodeModel);
      $scope.doLayout();
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

      nodes.click(function() {
        var thisNode = $(this);
        var newFlag = !thisNode.hasClass("selected");
        nodes.toggleClass("selected", false);
        thisNode.toggleClass("selected", newFlag);
        var id = thisNode.attr("id");
        console.log("node " + id + " selected " + newFlag);
        $scope.selectedFolder = null;
        if (newFlag && $scope.nodes) {
          var selectetedNode = $scope.nodes[id];
          console.log("Found selectedNode: " + selectetedNode);

          //$scope.selectedFolder =
          // find the folder for the id..
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

    function getWidth() {
      var canvasDiv = $($element);
      return canvasDiv.width();
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