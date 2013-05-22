module Wiki {
  export function CamelCanvasController($scope, $element, workspace:Workspace, jolokia) {

    $scope.$watch("camelContextTree", () => {
      var tree = $scope.camelContextTree;
      var doc = Core.pathGet(tree, ["xmlDocument"]);
      if (doc) {
        var nodes = [];
        var links = [];
        // TODO
        //var selectedRouteId = getSelectedRouteId(workspace);
        var selectedRouteId = "route1";
        Camel.loadRouteXmlNodes($scope, doc, selectedRouteId, nodes, links, getWidth());
        showGraph(nodes, links);
      }
    });

    var connectorStrokeColor = "rgba(50, 50, 200, 1)",
            connectorHighlightStrokeColor = "rgba(180, 180, 200, 1)",
            hoverPaintStyle = { strokeStyle: "#7ec3d9" };			// hover paint style is merged on normal style, so you
    // don't necessarily need to specify a lineWidth

    var overlays:any[] = ["PlainArrow", {location: 1, width: 20, length: 12} ];
    var stateMachineConnector = {
      connector: "StateMachine",
      paintStyle: {lineWidth: 3, strokeStyle: "#056"},
      hoverPaintStyle: {strokeStyle: "#dbe300"},
      endpoint: "Blank",
      anchor: "Continuous",
      overlays: [
        overlays
      ]
    };

    function showGraph(nodes, links) {
      var width = getWidth();
      var height = Camel.getCanvasHeight($($element));
      layoutGraph(nodes, links, width, height);
      return width;
    }

    function layoutGraph(nodes, links, width, height) {
      $scope.nodes = nodes;
      $scope.links = links;

      var nodePadding = 10;

      // TODO the creation of transitions and stateKeys could be reused across camel.ts
      var stateKeys = {};
      var transitions = [];

      nodes.forEach((node) => {
        var idx = node.id;
        if (idx === undefined) {
          console.log("No node found for node " + JSON.stringify(node));
        } else {
          if (node.edges === undefined) node.edges = [];
          if (!node.label) node.label = "node " + idx;
          stateKeys[idx] = node;
        }
      });
      var states = d3.values(stateKeys);
      links.forEach(function (d) {
        var source = stateKeys[d.source];
        var target = stateKeys[d.target];
        if (source === undefined || target === undefined) {
          console.log("Bad link!  " + source + " target " + target + " for " + d);
        } else {
          var edge = { source: source, target: target };
          transitions.push(edge);
          source.edges.push(edge);
          target.edges.push(edge);
          // TODO should we add the edge to the target?
        }
      });

      var containerElement = $($element);
      containerElement.children("div").remove();


      // Create the layout and get the graph
      dagre.layout()
              .nodeSep(50)
              .edgeSep(10)
              .rankSep(50)
              .nodes(states)
              .edges(transitions)
              .debugLevel(1)
              .run();

      var offset = containerElement.offset();
      var left = offset["left"];
      var top = offset["top"];

      angular.forEach(states, (node) => {
        var id = node.id;
        var x = node.x || 0;
        var y =  node["y:"] || 0;
        if (left) {
          x += left;
        }
/*
        if (top) {
          y += top;
        }
*/
        var style = "top: " + y  + "px; left: " + x + "px;";
        $("<div class='component window' id='node-" + id
                + "' title='" + node.tooltip
                + "' style='" + style + "'><img src='" + node.imageUrl + "'><span>" + node.label + "</span></div>").appendTo(containerElement);
      });

      jsPlumb.detachEveryConnection();

      angular.forEach(links, (link) => {
        console.log("connect " + link.source + " to " + link.target);
        jsPlumb.connect({
          source: "node-" + link.source,
          target: "node-" + link.target
        }, stateMachineConnector);
      });

      // make draggable
      var selector = jsPlumb.getSelector(".window");
      jsPlumb.draggable(selector);
/*
      jsPlumb.draggable(selector, {
        containment: containerElement
      });
*/
      return states;
    }

    function getWidth() {
      var canvasDiv = $($element);
      return canvasDiv.width();
    }

    if (jsPlumb) {
      jsPlumb.bind("ready", setup);
    }

    function setup() {
      jsPlumb.importDefaults({
        DragOptions: { cursor: "pointer", zIndex: 2000 },
        HoverClass: "connector-hover"
      });

      // double click on any connection
      jsPlumb.bind("dblclick", function (connection, originalEvent) {
        alert("double click on connection from " + connection.sourceId + " to " + connection.targetId);
      });
      // single click on any endpoint
      jsPlumb.bind("endpointClick", function (endpoint, originalEvent) {
        alert("click on endpoint on element " + endpoint.elementId);
      });
      // context menu (right click) on any component.
      jsPlumb.bind("contextmenu", function (component, originalEvent) {
        alert("context menu on component " + component.id);
        originalEvent.preventDefault();
        return false;
      });
    }
  }
}