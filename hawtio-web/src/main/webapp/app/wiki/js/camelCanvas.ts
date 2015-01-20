/**
 * @module Wiki
 */
/// <reference path="./wikiPlugin.ts"/>
module Wiki {
  _module.controller("Wiki.CamelCanvasController", ["$scope", "$element", "workspace", "jolokia", "wikiRepository", "$templateCache", "$interpolate", ($scope, $element, workspace:Workspace, jolokia, wikiRepository:GitWikiRepository, $templateCache, $interpolate) => {
    var jsPlumbInstance = jsPlumb.getInstance();

    $scope.addDialog = new UI.Dialog();
    $scope.propertiesDialog = new UI.Dialog();
    $scope.modified = false;
    $scope.camelIgnoreIdForLabel = Camel.ignoreIdForLabel(localStorage);
    $scope.camelMaximumLabelWidth = Camel.maximumLabelWidth(localStorage);
    $scope.camelMaximumTraceOrDebugBodyLength = Camel.maximumTraceOrDebugBodyLength(localStorage);

    $scope.forms = {};

    $scope.nodeTemplate = $interpolate($templateCache.get("nodeTemplate"));

    $scope.$watch("camelContextTree", () => {
      var tree = $scope.camelContextTree;
      $scope.rootFolder = tree;
      // now we've got cid values in the tree and DOM, lets create an index so we can bind the DOM to the tree model
      $scope.folders = Camel.addFoldersToIndex($scope.rootFolder);

      var doc = Core.pathGet(tree, ["xmlDocument"]);
      if (doc) {
        $scope.doc = doc;
        reloadRouteIds();
        onRouteSelectionChanged();
      }
    });

    $scope.addAndCloseDialog = () => {
      var nodeModel = $scope.selectedNodeModel();
      if (nodeModel) {
        addNewNode(nodeModel);
      }
      $scope.addDialog.close();
    };

    $scope.removeNode = () => {
      var folder = getSelectedOrRouteFolder();
      if (folder) {
        var nodeName = Camel.getFolderCamelNodeId(folder);
        folder.detach();
        if ("route" === nodeName) {
          // lets also clear the selected route node
          $scope.selectedRouteId = null;
        }
        updateSelection(null);
        treeModified();
      }
    };

    $scope.doLayout = () => {
      $scope.drawnRouteId = null;
      onRouteSelectionChanged();
    };

    function isRouteOrNode() {
      return !$scope.selectedFolder
    }

    $scope.getDeleteTitle = () => {
      if (isRouteOrNode()) {
        return "Delete this route";
      }
      return "Delete this node";
    }

    $scope.getDeleteTarget = () => {
      if (isRouteOrNode()) {
        return "Route";
      }
      return "Node";
    }

    $scope.isFormDirty = () => {
      log.debug("endpointForm: ", $scope.endpointForm);
      if ($scope.endpointForm.$dirty) {
        return true;
      }
      if (!$scope.forms['formEditor']) {
        return false;
      } else {
        return $scope.forms['formEditor']['$dirty'];
      }
    };

    /* TODO
     $scope.resetForms = () => {

     }
     */

    /*
     * Converts a path and a set of endpoint parameters into a URI we can then use to store in the XML
     */
    function createEndpointURI(endpointScheme:string, slashesText:string, endpointPath:string, endpointParameters:any) {
      console.log("scheme " + endpointScheme + " path " + endpointPath + " parameters " + endpointParameters);
      // now lets create the new URI from the path and parameters
      // TODO should we use JMX for this?
      var uri = ((endpointScheme) ? endpointScheme + ":" + slashesText : "") + (endpointPath ? endpointPath : "");
      var paramText = Core.hashToString(endpointParameters);
      if (paramText) {
        uri += "?" + paramText;
      }
      return uri;
    }

    $scope.updateProperties = () => {
      log.info("old URI is " + $scope.nodeData.uri);
      var uri = createEndpointURI($scope.endpointScheme, ($scope.endpointPathHasSlashes ? "//" : ""), $scope.endpointPath, $scope.endpointParameters);
      log.info("new URI is " + uri);
      if (uri) {
        $scope.nodeData.uri = uri;
      }

      var key = null;
      var selectedFolder = $scope.selectedFolder;
      if (selectedFolder) {
        key = selectedFolder.key;

        // lets delete the current selected node's div so its updated with the new template values
        var elements = $element.find(".canvas").find("[id='" + key + "']").first().remove();
      }

      treeModified();

      if (key) {
        updateSelection(key)
      }

      if ($scope.isFormDirty()) {
        $scope.endpointForm.$setPristine();
        if ($scope.forms['formEditor']) {
          $scope.forms['formEditor'].$setPristine();
        }
      }

      Core.$apply($scope);
    };

    $scope.save = () => {
      // generate the new XML
      if ($scope.rootFolder) {
        var xmlNode = Camel.generateXmlFromFolder($scope.rootFolder);
        if (xmlNode) {
          var text = Core.xmlNodeToString(xmlNode);
          if (text) {
            var decoded = decodeURIComponent(text);
            log.debug("Saving xml decoded: " + decoded);

            // lets save the file...
            var commitMessage = $scope.commitMessage || "Updated page " + $scope.pageId;
            wikiRepository.putPage($scope.branch, $scope.pageId, decoded, commitMessage, (status) => {
              Wiki.onComplete(status);
              Core.notification("success", "Saved " + $scope.pageId);
              $scope.modified = false;
              goToView();
              Core.$apply($scope);
            });
          }
        }
      }
    };

    $scope.cancel = () => {
      console.log("cancelling...");
      // TODO show dialog if folks are about to lose changes...
    };

    $scope.$watch("selectedRouteId", onRouteSelectionChanged);

    function goToView() {
      // TODO lets navigate to the view if we have a separate view one day :)
      /*
       if ($scope.breadcrumbs && $scope.breadcrumbs.length > 1) {
       var viewLink = $scope.breadcrumbs[$scope.breadcrumbs.length - 2];
       console.log("goToView has found view " + viewLink);
       var path = Core.trimLeading(viewLink, "#");
       $location.path(path);
       } else {
       console.log("goToView has no breadcrumbs!");
       }
       */
    }

    function addNewNode(nodeModel) {
      var doc = $scope.doc || document;
      var parentFolder = $scope.selectedFolder || $scope.rootFolder;
      var key = nodeModel["_id"];
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
          var parentTypeName = Camel.getFolderCamelNodeId(treeNode);
          if (!Camel.acceptOutput(parentTypeName)) {
            treeNode = treeNode.parent || treeNode;
          }
        }
        if (treeNode) {
          var node = doc.createElement(key);
          parentFolder = treeNode;
          var addedNode = Camel.addRouteChild(parentFolder, node);
          // TODO add the schema here for an element??
          // or default the data or something

          var nodeData = {
          };
          if (key === "endpoint" && $scope.endpointConfig) {
            var key = $scope.endpointConfig.key;
            if (key) {
              nodeData["uri"] = key + ":";
            }
          }
          addedNode["camelNodeData"] = nodeData;
          addedNode["endpointConfig"] = $scope.endpointConfig;

          if (key === "route") {
            // lets generate a new routeId and switch to it
            var count = $scope.routeIds.length;
            var nodeId = null;
            while (true) {
              nodeId = "route" + (++count);
              if (!$scope.routeIds.find(nodeId)) {
                break;
              }
            }
            addedNode["routeXmlNode"].setAttribute("id", nodeId);
            $scope.selectedRouteId = nodeId;
          }
        }
      }
      treeModified();
    }

    function treeModified(reposition = true) {
      // lets recreate the XML model from the update Folder tree
      var newDoc = Camel.generateXmlFromFolder($scope.rootFolder);
      var tree = Camel.loadCamelTree(newDoc, $scope.pageId);
      if (tree) {
        $scope.rootFolder = tree;
        $scope.doc = Core.pathGet(tree, ["xmlDocument"]);
      }
      $scope.modified = true;
      reloadRouteIds();
      $scope.doLayout();
      Core.$apply($scope);
    }


    function reloadRouteIds() {
      $scope.routeIds = [];
      var doc = $($scope.doc);
      $scope.camelSelectionDetails.selectedCamelContextId = doc.find("camelContext").attr("id");
      doc.find("route").each((idx, route) => {
        var id = route.getAttribute("id");
        if (id) {
          $scope.routeIds.push(id);
        }
      });
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
          updateSelection($scope.selectedRouteId);
          // now we've got cid values in the tree and DOM, lets create an index so we can bind the DOM to the tree model
          $scope.folders = Camel.addFoldersToIndex($scope.rootFolder);
          showGraph(nodes, links);
          $scope.drawnRouteId = $scope.selectedRouteId;
        }
        $scope.camelSelectionDetails.selectedRouteId = $scope.selectedRouteId;
      }
    }

    function showGraph(nodes, links) {
      layoutGraph(nodes, links);
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

    function getSelectedOrRouteFolder() {
      return $scope.selectedFolder || getRouteFolder($scope.rootFolder, $scope.selectedRouteId);
    }

    function getContainerElement() {
      var rootElement = $element;
      var containerElement = rootElement.find(".canvas");
      if (!containerElement || !containerElement.length) containerElement = rootElement;
      return containerElement;
    }

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

    $scope.$on('$destroy', () => {
      jsPlumbInstance.reset();
      delete jsPlumbInstance;
    });

    // double click on any connection
    jsPlumbInstance.bind("dblclick", function (connection, originalEvent) {
      if (jsPlumbInstance.isSuspendDrawing()) {
        return;
      }
      alert("double click on connection from " + connection.sourceId + " to " + connection.targetId);
    });

    jsPlumbInstance.bind('connection', function (info, evt) {
      //log.debug("Connection event: ", info);
      log.debug("Creating connection from ", info.sourceId, " to ", info.targetId);
      var link = getLink(info);
      var source = $scope.nodes[link.source];
      var sourceFolder = $scope.folders[link.source];
      var targetFolder = $scope.folders[link.target];
      if (Camel.isNextSiblingAddedAsChild(source.type)) {
        sourceFolder.moveChild(targetFolder);
      } else {
        sourceFolder.parent.insertAfter(targetFolder, sourceFolder);
      }
      treeModified();
    });

    // lets delete connections on click
    jsPlumbInstance.bind("click", function (c) {
      if (jsPlumbInstance.isSuspendDrawing()) {
        return;
      }
      jsPlumbInstance.detach(c);
    });


    function layoutGraph(nodes, links) {
      var transitions = [];
      var states = Core.createGraphStates(nodes, links, transitions);

      log.debug("links: ", links);
      log.debug("transitions: ", transitions);

      $scope.nodeStates = states;
      var containerElement = getContainerElement();

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

        containerElement.find('div.component').each((i, el) => {
          log.debug("Checking: ", el, " ", i);
          if (!states.any((node) => {
                return el.id === getNodeId(node);
              })) {
            log.debug("Removing element: ", el.id);
            jsPlumbInstance.remove(el);
          }
        });

        angular.forEach(states, (node) => {
          log.debug("node: ", node);
          var id = getNodeId(node);
          var div = containerElement.find('#' + id);

          if (!div[0]) {
            div = $($scope.nodeTemplate({
              id: id,
              node: node
            }));
            div.appendTo(containerElement);
          }

          // Make the node a jsplumb source
          jsPlumbInstance.makeSource(div, {
            filter: "img.nodeIcon",
            anchor: "Continuous",
            connector: connectorStyle,
            connectorStyle: { strokeStyle: "#666", lineWidth: 3 },
            maxConnections: -1
          });

          // and also a jsplumb target
          jsPlumbInstance.makeTarget(div, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous"
          });

          jsPlumbInstance.draggable(div, {
            containment: '.camel-canvas'
          });

          // add event handlers to this node
          div.click(function () {
            var newFlag = !div.hasClass("selected");
            containerElement.find('div.component').toggleClass("selected", false);
            div.toggleClass("selected", newFlag);
            var id = div.attr("id");
            updateSelection(newFlag ? id : null);
            Core.$apply($scope);
          });

          div.dblclick(function () {
            var id = div.attr("id");
            updateSelection(id);
            //$scope.propertiesDialog.open();
            Core.$apply($scope);
          });

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
          var id = getNodeId(node);
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


        containerElement.dblclick(function () {
          $scope.propertiesDialog.open();
        });

        jsPlumbInstance.setSuspendEvents(true);
        // Detach all the current connections and reconnect everything based on the updated graph
        jsPlumbInstance.detachEveryConnection({fireEvent: false});

        angular.forEach(links, (link) => {
          jsPlumbInstance.connect({
            source: getNodeId(link.source),
            target: getNodeId(link.target)
          });
        });
        jsPlumbInstance.setSuspendEvents(false);

      });


      return states;
    }

    function getLink(info) {
      var sourceId = info.sourceId;
      var targetId = info.targetId;
      return {
        source: sourceId,
        target: targetId
      }
    }

    function getNodeByCID(nodes, cid) {
      return nodes.find((node) => {
        return node.cid === cid;
      });
    }

    /*
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
      folder = getSelectedOrRouteFolder();
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
    }

    function getWidth() {
      var canvasDiv = $($element);
      return canvasDiv.width();
    }

    function getFolderIdAttribute(route) {
      var id = null;
      if (route) {
        var xmlNode = route["routeXmlNode"];
        if (xmlNode) {
          id = xmlNode.getAttribute("id");
        }
      }
      return id;
    }

    function getRouteFolder(tree, routeId) {
      var answer = null;
      if (tree) {
        angular.forEach(tree.children, (route) => {
          if (!answer) {
            var id = getFolderIdAttribute(route);
            if (routeId === id) {
              answer = route;
            }
          }
        });
      }
      return answer;
    }
  }]);
}
