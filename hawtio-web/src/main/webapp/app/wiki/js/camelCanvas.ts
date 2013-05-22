module Wiki {
  export function CamelCanvasController($scope, $element, workspace:Workspace, jolokia) {

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

    $scope.$watch("selectedRouteId", onRouteSelectionChanged);

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

    function layoutGraph(nodes, links, width, height) {
      var transitions = [];
      var states = Core.createGraphStates(nodes, links, transitions);

      var containerElement = $($element);
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

      var endpointStyle:any[] = ["Dot", {radius:2}];
      //var labelStyles: any[] = [ "Label", { label:"FOO", id:"label" }];
      var labelStyles: any[] = [ "Label" ];
      var arrowStyles: any[] = [ "Arrow", {
         						location:1,
         						id:"arrow",
         	                    length:14,
         	                    foldback:0.8
         					} ];
      jsPlumb.importDefaults({
   				Endpoint : endpointStyle,
   				HoverPaintStyle : {strokeStyle:"#42a62c", lineWidth:2 },
   				ConnectionOverlays : [
   					arrowStyles,
   	                labelStyles
   				]
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

      var offset = containerElement.offset();
      var left = Core.pathGet(offset, ["left"]) || 0;
      var top = Core.pathGet(offset, ["top"]) || 0;

      angular.forEach(states, (node) => {
        var id = "node-" + node.id;
        var x = node.x || 0;
        var y =  node["y:"] || 0;
        if (left) x += left;
        // if (top)  y += top;

        var style = "top: " + y  + "px; left: " + x + "px;";
        $("<div class='component window' id='" + id
                + "' title='" + node.tooltip
                + "' style='" + style + "'><img class='nodeIcon' src='" + node.imageUrl + "'>" +
                "<span class='nodeText'>" + node.label + "</span></div>").appendTo(containerElement);
      });

      var nodes = containerElement.find("div.component");

      var connectorStyle:any[] = [ "StateMachine", { curviness:20 } ];
      nodes.each(function(i,e) {
   				jsPlumb.makeSource($(e), {
   					filter:"img.nodeIcon",
   					anchor:"Continuous",
   					connector:connectorStyle,
   					connectorStyle:{ strokeStyle:"#666", lineWidth:2 },
   					maxConnections:-1
   				});
   			});

      jsPlumb.makeTarget(nodes, {
        dropOptions:{ hoverClass:"dragHover" },
    				anchor:"Continuous"
   			});

      angular.forEach(links, (link) => {
        jsPlumb.connect({
          source: "node-" + link.source,
          target: "node-" + link.target
        });
      });

      jsPlumb.draggable(nodes);
/*
      jsPlumb.draggable(nodes, {
        containment: containerElement
      });
*/

      // double click on any connection
      jsPlumb.bind("dblclick", function (connection, originalEvent) {
        alert("double click on connection from " + connection.sourceId + " to " + connection.targetId);
      });

      // lets delete connections on click
   			jsPlumb.bind("click", function(c) {
   				jsPlumb.detach(c);
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