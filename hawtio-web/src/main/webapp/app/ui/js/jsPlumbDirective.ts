/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  _module.directive('hawtioJsplumb', ["$timeout", ($timeout:ng.ITimeoutService) => {
    return {
      restrict: 'A',
      link: ($scope, $element, $attrs) => {

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
        function createNode(nodeEl) {
          var el = $(nodeEl);
          var id = el.attr('id');
          var anchors:any = el.attr('anchors');
          if (!Core.isBlank(anchors) && (anchors.has("{{") || anchors.has("}}"))) {
            // we don't want to add this yet...
            return null;
          }
          if (!Core.isBlank(anchors)) {
            anchors = anchors.split(',').map((anchor) => { return anchor.trim()});
          } else {
            anchors = ["Continuous"];
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


        function createEndpoint (jsPlumb, node) {
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

        function gatherElements() {
          var nodeEls = $element.find('.jsplumb-node');
          if (nodes.length > 0) {
            
          }
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

        $scope.$on('jsplumbDoWhileSuspended', (event, op) => {
          if ($scope.jsPlumb) {
            var jsPlumb = $scope.jsPlumb;
            jsPlumb.doWhileSuspended(() => {
              log.debug("Suspended jsplumb");
              $scope.jsPlumb.reset();
              op();
              nodes = [];
              nodesById = {};
              transitions = [];
              go();
            });
          }

        });

        function go() {
          if (!$scope.jsPlumb) {
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
          }

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
          if (!$scope.jsPlumb.isSuspendDrawing()) {
            $scope.jsPlumb.repaintEverything();
          }

          if (angular.isDefined($scope.jsPlumbCallback) && angular.isFunction($scope.jsPlumbCallback)) {
            $scope.jsPlumbCallback($scope.jsPlumb, $scope.jsPlumbNodes, $scope.jsPlumbNodesById, $scope.jsPlumbTransitions);
          }


        }

        // Kick off the initial layout of elements in the container
        $timeout(go, timeout);
      }
    };
  }]);
}

