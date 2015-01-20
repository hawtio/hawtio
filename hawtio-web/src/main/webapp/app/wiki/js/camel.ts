/**
 * @module Wiki
 */
/// <reference path="./wikiPlugin.ts"/>
module Wiki {

  _module.controller("Wiki.CamelController", ["$scope", "$location", "$routeParams", "localStorage", "workspace", "wikiRepository", "jolokia", ($scope, $location, $routeParams, localStorage:WindowLocalStorage, workspace:Workspace, wikiRepository:GitWikiRepository, jolokia) => {
    Wiki.initScope($scope, $routeParams, $location);
    Camel.initEndpointChooserScope($scope, $location, localStorage, workspace, jolokia);
    $scope.schema = Camel.getConfiguredCamelModel();
    $scope.modified = false;

    $scope.findProfileCamelContext = true;
    $scope.camelSelectionDetails = {
      selectedCamelContextId: null,
      selectedRouteId: null
    };

    $scope.isValid = (nav) => {
      return nav && nav.isValid(workspace);
    };

    $scope.camelSubLevelTabs = [
      {
        content: '<i class="icon-picture"></i> Canvas',
        title: "Edit the diagram in a draggy droppy way",
        isValid: (workspace:Workspace) => true,
        href: () => Wiki.startLink($scope.branch) + "/camel/canvas/" + $scope.pageId
      },
      {
        content: '<i class=" icon-sitemap"></i> Tree',
        title: "View the routes as a tree",
        isValid: (workspace:Workspace) => true,
        href: () => Wiki.startLink($scope.branch) + "/camel/properties/" + $scope.pageId
      },
      /*
       {
       content: '<i class="icon-sitemap"></i> Diagram',
       title: "View a diagram of the route",
       isValid: (workspace:Workspace) => true,
       href: () => Wiki.startLink($scope.branch) + "/camel/diagram/" + $scope.pageId
       },
       */
    ];

    var routeModel = _apacheCamelModel.definitions.route;
    routeModel["_id"] = "route";

    $scope.addDialog = new UI.Dialog();

    // TODO doesn't seem that angular-ui uses these?
    $scope.addDialog.options["dialogClass"] = "modal-large";
    $scope.addDialog.options["cssClass"] = "modal-large";

    $scope.paletteItemSearch = "";
    $scope.paletteTree = new Folder("Palette");
    $scope.paletteActivations = ["Routing_aggregate"];

    // load $scope.paletteTree
    angular.forEach(_apacheCamelModel.definitions, (value, key) => {
      if (value.group) {
        var group = (key === "route") ? $scope.paletteTree : $scope.paletteTree.getOrElse(value.group);
        if (!group.key) {
          group.key = value.group;
        }
        value["_id"] = key;
        var title = value["title"] || key;
        var node = new Folder(title);
        node.key = group.key + "_" + key;
        node["nodeModel"] = value;
        var imageUrl = Camel.getRouteNodeIcon(value);
        node.icon = imageUrl;
        // compiler was complaining about 'label' had no idea where it's coming from
        // var tooltip = value["tooltip"] || value["description"] || label;
        var tooltip = value["tooltip"] || value["description"] || '';
        node.tooltip = tooltip;

        group.children.push(node);
      }
    });

    // load $scope.componentTree
    $scope.componentTree = new Folder("Endpoints");

    $scope.$watch("componentNames", () => {
      var componentNames = $scope.componentNames;
      if (componentNames && componentNames.length) {
        $scope.componentTree = new Folder("Endpoints");
        angular.forEach($scope.componentNames, (endpointName) => {
          var category = Camel.getEndpointCategory(endpointName);
          var groupName = category.label || "Core";
          var groupKey = category.id || groupName;
          var group = $scope.componentTree.getOrElse(groupName);

          var value = Camel.getEndpointConfig(endpointName, category);
          var key = endpointName;
          var label = value["label"] || endpointName;
          var node = new Folder(label);
          node.key = groupKey + "_" + key;
          node.key = key;
          node["nodeModel"] = value;
          var tooltip = value["tooltip"] || value["description"] || label;
          var imageUrl = Core.url(value["icon"] || Camel.endpointIcon);
          node.icon = imageUrl;
          node.tooltip = tooltip;

          group.children.push(node);
        });
      }
    });
    $scope.componentActivations = ["bean"];

    $scope.$watch('addDialog.show', function () {
      if ($scope.addDialog.show) {
        setTimeout(function () {
          $('#submit').focus();
        }, 50);
      }
    });

    $scope.$on("hawtio.form.modelChange", onModelChangeEvent);

    $scope.onRootTreeNode = (rootTreeNode) => {
      $scope.rootTreeNode = rootTreeNode;
      // restore the real data at the root for saving the doc etc
      rootTreeNode.data = $scope.camelContextTree;
    };

    $scope.addNode = () => {
      if ($scope.nodeXmlNode) {
        $scope.addDialog.open();
      } else {
        addNewNode(routeModel);
      }
    };

    $scope.onPaletteSelect = (node) => {
      $scope.selectedPaletteNode = (node && node["nodeModel"]) ? node : null;
      if ($scope.selectedPaletteNode) {
        $scope.selectedComponentNode = null;
      }
      console.log("Selected " + $scope.selectedPaletteNode + " : " + $scope.selectedComponentNode);
    };

    $scope.onComponentSelect = (node) => {
      $scope.selectedComponentNode = (node && node["nodeModel"]) ? node : null;
      if ($scope.selectedComponentNode) {
        $scope.selectedPaletteNode = null;
        var nodeName = node.key;
        console.log("loading endpoint schema for node " + nodeName);
        $scope.loadEndpointSchema(nodeName);
        $scope.selectedComponentName = nodeName;
      }
      console.log("Selected " + $scope.selectedPaletteNode + " : " + $scope.selectedComponentNode);
    };

    $scope.selectedNodeModel = () => {
      var nodeModel = null;
      if ($scope.selectedPaletteNode) {
        nodeModel = $scope.selectedPaletteNode["nodeModel"];
        $scope.endpointConfig = null;
      } else if ($scope.selectedComponentNode) {
        // TODO lest create an endpoint nodeModel and associate
        // the dummy URL and properties etc...
        var endpointConfig = $scope.selectedComponentNode["nodeModel"];
        var endpointSchema = $scope.endpointSchema;
        nodeModel = $scope.schema.definitions.endpoint;
        $scope.endpointConfig = {
          key: $scope.selectedComponentNode.key,
          schema: endpointSchema,
          details: endpointConfig
        };
      }
      return nodeModel;
    };

    $scope.addAndCloseDialog = () => {
      var nodeModel = $scope.selectedNodeModel();
      if (nodeModel) {
        addNewNode(nodeModel);
      } else {
        console.log("WARNING: no nodeModel!");
      }
      $scope.addDialog.close();
    };

    $scope.removeNode = () => {
      if ($scope.selectedFolder && $scope.treeNode) {
        $scope.selectedFolder.detach();
        $scope.treeNode.remove();
        $scope.selectedFolder = null;
        $scope.treeNode = null;
      }
    };

    $scope.canDelete = () => {
      return $scope.selectedFolder ? true : false;
    };

    $scope.isActive = (nav) => {
      if (angular.isString(nav))
        return workspace.isLinkActive(nav);
      var fn = nav.isActive;
      if (fn) {
        return fn(workspace);
      }
      return workspace.isLinkActive(nav.href());
    };

    $scope.save = () => {
      // generate the new XML
      if ($scope.rootTreeNode) {
        var xmlNode = Camel.generateXmlFromFolder($scope.rootTreeNode);
        if (xmlNode) {
          var text = Core.xmlNodeToString(xmlNode);
          if (text) {
            // lets save the file...
            var commitMessage = $scope.commitMessage || "Updated page " + $scope.pageId;
            wikiRepository.putPage($scope.branch, $scope.pageId, text, commitMessage, (status) => {
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

    $scope.$watch('workspace.tree', function () {
      if (!$scope.git) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        //console.log("Reloading the view as we now seem to have a git mbean!");
        setTimeout(updateView, 50);
      }
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    function getFolderXmlNode(treeNode) {
      var routeXmlNode = Camel.createFolderXmlTree(treeNode, null);
      if (routeXmlNode) {
        $scope.nodeXmlNode = routeXmlNode;
      }
      return routeXmlNode;
    }

    $scope.onNodeSelect = (folder, treeNode) => {
      $scope.selectedFolder = folder;
      $scope.treeNode = treeNode;
      $scope.propertiesTemplate = null;
      $scope.diagramTemplate = null;
      $scope.nodeXmlNode = null;
      if (folder) {
        $scope.nodeData = Camel.getRouteFolderJSON(folder);
        $scope.nodeDataChangedFields = {};
      }
      var nodeName = Camel.getFolderCamelNodeId(folder);
      // lets lazily create the XML tree so it can be used by the diagram
      var routeXmlNode = getFolderXmlNode(treeNode);
      if (nodeName) {
        //var nodeName = routeXmlNode.localName;
        $scope.nodeModel = Camel.getCamelSchema(nodeName);
        if ($scope.nodeModel) {
          $scope.propertiesTemplate = "app/wiki/html/camelPropertiesEdit.html";
        }
        $scope.diagramTemplate = "app/camel/html/routes.html";
        Core.$apply($scope);
      }
    };

    $scope.onNodeDragEnter = (node, sourceNode) => {
      var nodeFolder = node.data;
      var sourceFolder = sourceNode.data;
      if (nodeFolder && sourceFolder) {
        var nodeId = Camel.getFolderCamelNodeId(nodeFolder);
        var sourceId = Camel.getFolderCamelNodeId(sourceFolder);
        if (nodeId && sourceId) {
          // we can only drag routes onto other routes (before / after / over)
          if (sourceId === "route") {
            return nodeId === "route";
          }
          return true;
        }
      }
      return false;
    };

    $scope.onNodeDrop = (node, sourceNode, hitMode, ui, draggable) => {
      var nodeFolder = node.data;
      var sourceFolder = sourceNode.data;
      if (nodeFolder && sourceFolder) {
        // we cannot drop a route into a route or a non-route to a top level!
        var nodeId = Camel.getFolderCamelNodeId(nodeFolder);
        var sourceId = Camel.getFolderCamelNodeId(sourceFolder);

        if (nodeId === "route") {
          // hitMode must be "over" if we are not another route
          if (sourceId === "route") {
            if (hitMode === "over") {
              hitMode = "after";
            }
          } else {
            // disable before / after
            hitMode = "over";
          }
        }
        else {
          if (Camel.acceptOutput(nodeId)) {
            hitMode = "over";
          } else {
            if (hitMode !== "before") {
              hitMode = "after";
            }
          }
        }
        console.log("nodeDrop nodeId: " + nodeId + " sourceId: " + sourceId + " hitMode: " + hitMode);

        sourceNode.move(node, hitMode);
      }
    };


    updateView();

    function addNewNode(nodeModel) {
      var doc = $scope.doc || document;
      var parentFolder = $scope.selectedFolder || $scope.camelContextTree;
      var key = nodeModel["_id"];
      var beforeNode = null;
      if (!key) {
        console.log("WARNING: no id for model " + JSON.stringify(nodeModel));
      } else {
        var treeNode = $scope.treeNode;
        if (key === "route") {
          // lets add to the root of the tree
          treeNode = $scope.rootTreeNode;
        } else {
          if (!treeNode) {
            // lets select the last route - and create a new route if need be
            var root = $scope.rootTreeNode;
            var children = root.getChildren();
            if (!children || !children.length) {
              addNewNode(Camel.getCamelSchema("route"));
              children = root.getChildren();
            }
            if (children && children.length) {
              treeNode = children[children.length - 1];
            } else {
              console.log("Could not add a new route to the empty tree!");
              return;
            }
          }


          // if the parent folder likes to act as a pipeline, then add
          // after the parent, rather than as a child
          var parentId = Camel.getFolderCamelNodeId(treeNode.data);
          if (!Camel.acceptOutput(parentId)) {
            // lets add the new node to the end of the parent
            beforeNode = treeNode.getNextSibling();
            treeNode = treeNode.getParent() || treeNode;
          }
        }
        if (treeNode) {
          var node = doc.createElement(key);
          parentFolder = treeNode.data;
          var addedNode = Camel.addRouteChild(parentFolder, node);
          if (addedNode) {
            var added = treeNode.addChild(addedNode, beforeNode);
            if (added) {
              getFolderXmlNode(added);
              added.expand(true);
              added.select(true);
              added.activate(true);
            }
          }
        }
      }
    }

    function onModelChangeEvent(event, name) {
      // lets filter out events due to the node changing causing the
      // forms to be recreated
      if ($scope.nodeData) {
        var fieldMap = $scope.nodeDataChangedFields;
        if (fieldMap) {
          if (fieldMap[name]) {
            onNodeDataChanged();
          } else {
            // the selection has just changed so we get the initial event
            // we can ignore this :)
            fieldMap[name] = true;
          }
        }
      }
    }

    function onNodeDataChanged() {
      $scope.modified = true;
      var selectedFolder = $scope.selectedFolder;
      if ($scope.treeNode && selectedFolder) {
        var routeXmlNode = getFolderXmlNode($scope.treeNode);
        if (routeXmlNode) {
          var nodeName = routeXmlNode.localName;
          var nodeSettings = Camel.getCamelSchema(nodeName);
          if (nodeSettings) {
            // update the title and tooltip etc
            Camel.updateRouteNodeLabelAndTooltip(selectedFolder, routeXmlNode, nodeSettings);
            $scope.treeNode.render(false, false);
          }
        }
        // TODO not sure we need this to be honest
        selectedFolder["camelNodeData"] = $scope.nodeData;
      }
    }

    function onResults(response) {
      var text = response.text;
      if (text) {
        // lets remove any dodgy characters so we can use it as a DOM id
        var tree = Camel.loadCamelTree(text, $scope.pageId);
        if (tree) {
          $scope.camelContextTree = tree;
        }
      } else {
        console.log("No XML found for page " + $scope.pageId);
      }
      Core.$applyLater($scope);
    }

    function updateView() {
      $scope.loadEndpointNames();
      $scope.pageId = Wiki.pageId($routeParams, $location);
      console.log("Has page id: " + $scope.pageId + " with $routeParams " + JSON.stringify($routeParams));

      if (Git.getGitMBean(workspace)) {
        $scope.git = wikiRepository.getPage($scope.branch, $scope.pageId, $scope.objectId, onResults);
      }
    }


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
  }]);
}
