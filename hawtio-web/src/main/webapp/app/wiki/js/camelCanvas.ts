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
    var states = [];
    var transitions = [];
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
    $scope.selectedNode = null;

    $scope.addDialog = new UI.Dialog();
    $scope.propertiesDialog = new UI.Dialog();
    $scope.modified = false;
    $scope.camelIgnoreIdForLabel = Camel.ignoreIdForLabel(localStorage);
    $scope.camelMaximumLabelWidth = Camel.maximumLabelWidth(localStorage);
    $scope.camelMaximumTraceOrDebugBodyLength = Camel.maximumTraceOrDebugBodyLength(localStorage);

    $scope.$on('$destroy', () => {
      jsPlumbInstance.reset();
      delete jsPlumbInstance;
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

    $scope.$watch("selectedNode", () => {
      if ($scope.selectedNode) {
        var nodeName = Camel.getFolderCamelNodeId($scope.selectedNode);
        $scope.nodeData = Camel.getRouteFolderJSON($scope.selectedNode);
        $scope.nodeDataChangedFields = {};
        $scope.nodeModel = Camel.getCamelSchema(nodeName);
        if ($scope.nodeModel) {
          $scope.propertiesTemplate = "app/wiki/html/camelPropertiesEdit.html";
        }
        $scope.selectedEndpoint = null;
        if ("endpoint" === nodeName) {
          var uri = $scope.nodeData["uri"];
          if (uri) {
            // lets decompose the URI into scheme, path and parameters
            var idx = uri.indexOf(":");
            if (idx > 0) {
              var endpointScheme = uri.substring(0, idx);
              var endpointPath = uri.substring(idx + 1);
              // for empty paths lets assume we need // on a URI
              $scope.endpointPathHasSlashes = endpointPath ? false : true;
              if (endpointPath.startsWith("//")) {
                endpointPath = endpointPath.substring(2);
                $scope.endpointPathHasSlashes = true;
              }
              idx = endpointPath.indexOf("?");
              var endpointParameters = {};
              if (idx > 0) {
                var parameters = endpointPath.substring(idx + 1);
                endpointPath = endpointPath.substring(0, idx);
                endpointParameters = Core.stringToHash(parameters);
              }

              $scope.endpointScheme = endpointScheme;
              $scope.endpointPath = endpointPath;
              $scope.endpointParameters = endpointParameters;

              console.log("endpoint " + endpointScheme + " path " + endpointPath + " and parameters " + JSON.stringify(endpointParameters));
              $scope.loadEndpointSchema(endpointScheme);
              $scope.selectedEndpoint = {
                endpointScheme: endpointScheme,
                endpointPath: endpointPath,
                parameters: endpointParameters
              };
            }
          }
        }
      }
    });

    $scope.$watch("selectedRouteId", () => {
      if ($scope.selectedRouteId) {
        jsPlumbInstance.reset();

        jsPlumbInstance.bind('beforeDrop', function(info) {
          var nodeIds = _.pluck(nodes, 'cid');
          var sourceLinkIndex = _.indexOf(nodeIds, info.sourceId);
          var targetLinkIndex = _.indexOf(nodeIds, info.targetId);

          var allow = (info.sourceId !== info.targetId) &&
            !(_.find(links, (link) => {
              return link.source == sourceLinkIndex && link.target == targetLinkIndex;
            }));

          return allow;
        });

        jsPlumbInstance.bind("click", function (c) {
          jsPlumbInstance.detach(c);
        });

        jsPlumbInstance.bind('connection', function (info) {
          var nodeIds = _.pluck(nodes, 'cid');
          var sourceLinkIndex = _.indexOf(nodeIds, info.sourceId);
          var targetLinkIndex = _.indexOf(nodeIds, info.targetId);

          var existingLink = _.find(links, (link) => {
            return link.source == sourceLinkIndex && link.target == targetLinkIndex;
          });

          if (!existingLink) {
            links.push({source: sourceLinkIndex, target: targetLinkIndex});
          }
        });

        jsPlumbInstance.bind('connectionMoved', function (info) {
          var nodeIds = _.pluck(nodes, 'cid');
          var sourceLinkIndex = _.indexOf(nodeIds, info.originalSourceId);
          var targetLinkIndex = _.indexOf(nodeIds, info.originalTargetId);

          links = _.filter(links, function(item) {
            return item.source != sourceLinkIndex || item.target != targetLinkIndex;
          });
        });

        jsPlumbInstance.bind('connectionDetached', function (info) {
          var nodeIds = _.pluck(nodes, 'cid');
          var sourceLinkIndex = _.indexOf(nodeIds, info.sourceId);
          var targetLinkIndex = _.indexOf(nodeIds, info.targetId);

          links = _.filter(links, function(item) {
            return item.source != sourceLinkIndex || item.target != targetLinkIndex;
          });
        });

        containerElement.html('');
        canvasDiv.click(() => {
          containerElement.find('.selected').removeClass('selected');
          $scope.selectedNode = null;
        });

        Camel.loadRouteXmlNodes($scope, $scope.doc, $scope.selectedRouteId, nodes, links, canvasDiv.width());

        states = Core.createGraphStates(nodes, links, transitions);

        jsPlumbInstance.doWhileSuspended(() => {
          //set our container to some arbitrary initial size
          containerElement.css({
            'width': '800px',
            'height': '800px',
            'min-height': '800px',
            'min-width': '800px'
          });

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

            $(div).click((event) => {
              var div = $(event.currentTarget);
              div.parent().find('.selected').removeClass('selected');
              div.addClass('selected');

              $scope.selectedNode = folders[div.attr('id')];

              event.stopPropagation();
            });

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

          $scope.doLayout();
        });
      }
    });

    $scope.doLayout = () => {
      jsPlumbInstance.setSuspendEvents(true);
      jsPlumbInstance.detachEveryConnection();
      jsPlumbInstance.setSuspendEvents(false);

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

      var containerHeight = 0;
      var containerWidth = 0;

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

      angular.forEach(links, (link) => {
        jsPlumbInstance.connect({
          source: nodes[link.source].cid,
          target: nodes[link.target].cid
        });
      });

      // size the container to fit the graph
      containerElement.css({
        'width': containerWidth,
        'height': containerHeight,
        'min-height': containerHeight,
        'min-width': containerWidth
      });
    };

  }]);

};
