/**
 * @module Wiki
 */
/// <reference path="./wikiPlugin.ts"/>
module Wiki {
  _module.controller("Wiki.CamelCanvasController", ["$scope", "$element", "$templateCache", "$interpolate", ($scope, $element, $templateCache, $interpolate) => {
    var canvasDiv = $($element);
    var containerElement = $(canvasDiv.find(".canvas"));

    var nodes = [];
    var links = [];
    var folders = {};

    var jsPlumbInstance = jsPlumb.getInstance();

    var nodeTemplate = $interpolate($templateCache.get("nodeTemplate"));

    // configure canvas layout and styles
    var endpointStyle:any[] = ["Dot", { radius: 4, cssClass: 'camel-canvas-endpoint' }];
    var hoverPaintStyle = { strokeStyle: "red", lineWidth: 3 };
    //var labelStyles: any[] = [ "Label", { label:"FOO", id:"label" }];
    var labelStyles:any[] = [ "Label" ];
    var arrowStyles:any[] = [ "Arrow", {
      location: 1,
      id: "arrow",
      length: 8,
      width: 8,
      foldback: 0.8
    } ];
    var connectorStyle:any[] = [ "StateMachine", { curviness: 10, proximityLimit: 50 } ];

    jsPlumbInstance.importDefaults({
      Endpoint: endpointStyle,
      HoverPaintStyle: hoverPaintStyle,
      ConnectionOverlays: [
        arrowStyles,
        labelStyles
      ]
    });

    $scope.contextIds = [];
    $scope.routeIds = [];

    $scope.selectedRouteId = null;

    $scope.addDialog = new UI.Dialog();
    $scope.propertiesDialog = new UI.Dialog();
    $scope.modified = false;
    $scope.camelIgnoreIdForLabel = Camel.ignoreIdForLabel(localStorage);
    $scope.camelMaximumLabelWidth = Camel.maximumLabelWidth(localStorage);
    $scope.camelMaximumTraceOrDebugBodyLength = Camel.maximumTraceOrDebugBodyLength(localStorage);

    $scope.$on('$destroy', () => {
      jsPlumbInstance.reset();
    });

    $scope.$watch("camelContextTree", () => {
      $scope.contextIds = [];
      $scope.routeIds = [];

      if ($scope.camelContextTree) {
        // now we've got cid values in the tree and DOM, lets create an index so we can bind the DOM to the tree model
        folders = Camel.addFoldersToIndex($scope.camelContextTree);

        $scope.doc = Core.pathGet($scope.camelContextTree, ["xmlDocument"]);
        log.debug("Camel doc:", $scope.doc);

        $scope.contextIds = [];

        $($scope.doc).find("camelContext").each((index, elem) => {
          var camelContextId = elem.getAttribute("id");
          if (camelContextId) {
            $scope.contextIds.push(camelContextId);
          }
          $(elem).find("route").each((idx, route) => {
            var id = route.getAttribute("id");
            if (id) {
              $scope.routeIds.push(id);
            }
          });
          $scope.selectedRouteId = $scope.routeIds[0];

          log.debug("Camel context IDs:", $scope.contextIds);
          log.debug("Camel route IDs:", $scope.routeIds);
          log.debug("Camel folders map:", folders);
        });
      }
    });

    $scope.$watch("selectedRouteId", () => {
      if ($scope.selectedRouteId) {
        jsPlumbInstance.reset();

        jsPlumbInstance.bind('beforeDrop', function(info) {
          return (info.sourceId !== info.targetId);
        });

        jsPlumbInstance.bind("click", function (c) {
          jsPlumbInstance.detach(c);
        });

        containerElement.html('');

        Camel.loadRouteXmlNodes($scope, $scope.doc, $scope.selectedRouteId, nodes, links, canvasDiv.width());

        var transitions = [];
        var states = Core.createGraphStates(nodes, links, transitions);

        jsPlumbInstance.doWhileSuspended(() => {
          //set our container to some arbitrary initial size
          containerElement.css({
            'width': '800px',
            'height': '800px',
            'min-height': '800px',
            'min-width': '800px'
          });
          var containerHeight = 0;
          var containerWidth = 0;

          var createdNodes = [];

          angular.forEach(states, (node) => {
            log.debug("node: ", node);
            var div = containerElement.find('#' + node.cid);

            div = $(nodeTemplate({
              id: node.cid,
              node: node
            }));
            div.appendTo(containerElement);

            var height = div.height();
            var width = div.width();
            if (height || width) {
              node.width = width;
              node.height = height;
              div.css({
                'min-width': width,
                'min-height': height
              });
            }

            createdNodes.push(div);
          });

          // Make the node a jsplumb source
          jsPlumbInstance.makeSource(createdNodes, {
            filter: "img.nodeIcon",
            anchor: "Continuous",
            connector: connectorStyle,
            connectorStyle: { strokeStyle: "#666", lineWidth: 3 },
            maxConnections: -1
          });

          // and also a jsplumb target
          jsPlumbInstance.makeTarget(createdNodes, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous"
          });

          jsPlumbInstance.draggable(createdNodes, {
            containment: '.camel-canvas'
          });

          angular.forEach(links, (link) => {
            jsPlumbInstance.connect({
              source: nodes[link.source].cid,
              target: nodes[link.target].cid
            });
          });

          var edgeSep = 10;

          // Create the layout and get the buildGraph
          dagre.layout()
              .nodeSep(100)
              .edgeSep(edgeSep)
              .rankSep(75)
              .nodes(states)
              .edges(transitions)
              .debugLevel(1)
              .run();

          angular.forEach(states, (node) => {

            // position the node in the graph
            var id = node.cid;
            var div = $("#" + id);
            var divHeight = div.height();
            var divWidth = div.width();
            var leftOffset = node.dagre.x + divWidth;
            var bottomOffset = node.dagre.y + divHeight;
            if (containerHeight < bottomOffset) {
              containerHeight = bottomOffset + edgeSep * 2;
            }
            if (containerWidth < leftOffset) {
              containerWidth = leftOffset + edgeSep * 2;
            }
            div.css({top: node.dagre.y, left: node.dagre.x});
          });

          // size the container to fit the graph
          containerElement.css({
            'width': containerWidth,
            'height': containerHeight,
            'min-height': containerHeight,
            'min-width': containerWidth
          });
        });
      }
    });

  }]);

};
