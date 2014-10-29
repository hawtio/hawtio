/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  _module.directive('hawtioJsplumb', () => {
    return new UI.JSPlumb();
  });

  export class JSPlumb {
    public restrict = 'A';

    public link = ($scope, $element, $attrs) => {

      // Whether or not each node in the graph can be dragged around
      var enableDragging = true;
      if (angular.isDefined($attrs['draggable'])) {
        enableDragging = Core.parseBooleanValue($attrs['draggable']);
      }

      var useLayout = true;
      if (angular.isDefined($attrs['layout'])) {
        useLayout = Core.parseBooleanValue($attrs['layout']);
      }

      var nodeSep = 50;
      var edgeSep = 10;
      var rankSep = 50;

      if (angular.isDefined($attrs['nodeSep'])) {
        nodeSep = Core.parseIntValue($attrs['nodeSep']);
      }
      if (angular.isDefined($attrs['edgeSep'])) {
        edgeSep = Core.parseIntValue($attrs['edgeSep']);
      }
      if (angular.isDefined($attrs['rankSep'])) {
        rankSep = Core.parseIntValue($attrs['rankSep']);
      }

      var timeout = 100;
      if (angular.isDefined($attrs['timeout'])) {
        timeout = Core.parseIntValue($attrs['timeout'], "timeout");
      }

      var endpointStyle:any[] = ["Dot", { radius: 10, cssClass: 'jsplumb-circle', hoverClass: 'jsplumb-circle-hover' }];
      var labelStyles:any[] = [ "Label" ];
      var arrowStyles:any[] = [ "Arrow", {
        location: 1,
        id: "arrow",
        length: 8,
        width: 8,
        foldback: 0.8
      } ];

      var connectorStyle:any[] = [ "Flowchart", { cornerRadius: 4, gap: 8 } ];

      if (angular.isDefined($scope.connectorStyle)) {
        connectorStyle = $scope.connectorStyle;
      }


      // Given an element, create a node data structure
      var createNode = (nodeEl) => {
        var el = $(nodeEl);
        var id = el.attr('id');
        var anchors:any = el.attr('anchors');
        if (anchors.has("{{") || anchors.has("}}")) {
          // we don't want to add this yet...
          return null;
        }
        if (anchors) {
          anchors = anchors.split(',').map((anchor) => { return anchor.trim()});
        } else {
          anchors = ["Top"];
        }

        var node = {
          id: id,
          label: 'node ' + id,
          el: el,
          width: el.outerWidth(),
          height: el.outerHeight(),
          edges: [],
          connections: [],
          endpoints: [],
          anchors: anchors
        };

        return node;
      };


      var createEndpoint = (jsPlumb, node) => {
        var endpoint = jsPlumb.addEndpoint(node.el, {
          isSource: true,
          isTarget: true,
          anchor: node.anchors,
          connector: connectorStyle,
          maxConnections: -1
        });
        node.endpoints.push(endpoint);
        //$scope.jsPlumbEndpoints[node.id] = endpoint
        if (enableDragging) {
          jsPlumb.draggable(node.el, {
            containment: $element
          });
        }
      };

      var nodes = [];
      var transitions = [];
      var nodesById = {};

      var gatherElements = () => {

        var nodeEls = $element.find('.jsplumb-node');

        angular.forEach(nodeEls, (nodeEl) => {
          if (!nodesById[nodeEl.id]) {
            var node = createNode(nodeEl);
            if (node) {
              nodes.push(node);
              nodesById[node.id] = node;
            }
          }
        });

        angular.forEach(nodes, (sourceNode) => {
          var targets:any = sourceNode.el.attr('connect-to');
          if (targets) {
            targets = targets.split(',');
            angular.forEach(targets, (target) => {
              var targetNode = nodesById[target.trim()];
              if (targetNode) {
                var edge = {
                  source: sourceNode,
                  target: targetNode
                };
                transitions.push(edge);
                sourceNode.edges.push(edge);
                targetNode.edges.push(edge);
              }
            });
          }
        });

      };

      $element.bind('DOMNodeInserted', (event) => {
        if ($scope.jsPlumb) {
          if (angular.isString(event.target.className)
              && !event.target.className.has("_jsPlumb_endpoint_anchor_")
              && event.target.className.has("jsplumb-node")) {
            // TODO - handle added nodes here, like from ng-repeat for example
            //console.log("DOMNodeInserted: ", event);
            gatherElements();
            var newNodes = nodes.filter((node) => { return node.endpoints.isEmpty(); });
            if (newNodes && newNodes.length) {
              angular.forEach(newNodes, (node) => {
                //console.log("Adding node: ", node.id);
                createEndpoint($scope.jsPlumb, node);
              });
              $scope.jsPlumb.repaintEverything();
              Core.$applyLater($scope);
            }
          }
        }
      });

      // Kick off the initial layout of elements in the container
      setTimeout(() => {
        $scope.jsPlumb = jsPlumb.getInstance({
          Container: $element
        });

        $scope.jsPlumb.importDefaults({
          Anchor: "AutoDefault",
          Connector: "Flowchart",
          ConnectorStyle: connectorStyle,
          DragOptions : { cursor: "pointer", zIndex:2000 },
          Endpoint: endpointStyle,
          PaintStyle: { strokeStyle: "#42a62c", lineWidth: 4 },
          HoverPaintStyle: { strokeStyle: "#42a62c", lineWidth: 4 },
          ConnectionOverlays: [
            arrowStyles,
            labelStyles
          ]
        });

        gatherElements();

        $scope.jsPlumbNodes = nodes;
        $scope.jsPlumbNodesById = nodesById;
        $scope.jsPlumbTransitions = transitions;
        //$scope.jsPlumbEndpoints = {};
        //$scope.jsPlumbConnections = [];

        // First we'll lay out the graph and then later apply jsplumb to all
        // of the nodes and connections
        if (useLayout) {
          $scope.layout = dagre.layout()
              .nodeSep(nodeSep)
              .edgeSep(edgeSep)
              .rankSep(rankSep)
              .nodes(nodes)
              .edges(transitions)
              .debugLevel(1)
              .run();
        }

        angular.forEach($scope.jsPlumbNodes, (node) => {
          if (useLayout) {
            var divWidth = node.el.width();
            var divHeight = node.el.height();
            var y = node.dagre.y - (divHeight / 2);
            var x = node.dagre.x - (divWidth / 2);
            node.el.css({top: y, left: x});
          }
          createEndpoint($scope.jsPlumb, node);
        });

        angular.forEach($scope.jsPlumbTransitions, (edge) => {
          var connection = $scope.jsPlumb.connect({
            source: edge.source.el,
            target: edge.target.el
          }, {
            connector: connectorStyle,
            maxConnections: -1
          });
          edge.source.connections.push(connection);
          edge.target.connections.push(connection);
          //$scope.jsPlumbConnections.push(connection);
        });

        $scope.jsPlumb.recalculateOffsets($element);
        $scope.jsPlumb.repaintEverything();

        if (angular.isDefined($scope.jsPlumbCallback) && angular.isFunction($scope.jsPlumbCallback)) {
          $scope.jsPlumbCallback($scope.jsPlumb, $scope.jsPlumbNodes, $scope.jsPlumbNodesById, $scope.jsPlumbTransitions);
        }

        Core.$apply($scope);
      }, timeout);
    };
  }
}
