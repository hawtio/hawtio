module Wiki {

  export function CamelController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {
    $scope.schema = _apacheCamelModel;

    var routeModel = _apacheCamelModel.definitions.route;
    routeModel["_id"] = "route";

    $scope.addDialogOptions = {
      backdropFade: true,
      dialogFade: true
    };
    $scope.showAddDialog = false;

    $scope.paletteItemSearch = "";
    $scope.paletteTree = new Folder("Palette");

    angular.forEach(_apacheCamelModel.definitions, (value, key) => {
      if (value.group) {
        var group = $scope.paletteTree.getOrElse(value.group);
        value["_id"] = key;
        var title = value["title"] || key;
        var node = new Folder(title);
        node["nodeModel"] = value;
        var imageUrl = Camel.getRouteNodeIcon(value);
        node.icon = imageUrl;
        node.tooltip = tooltip;
        var tooltip = value["tooltip"] || value["description"] || label;

        group.children.push(node);
      }
    });

    $scope.addNode = () => {
      if ($scope.nodeXmlNode) {
        $scope.showAddDialog = true;
      } else {
        addNewNode(routeModel);
      }
    };

    $scope.closeAddDialog = () => {
      $scope.showAddDialog = false;
    };

    $scope.onPaletteSelect = (node) => {
      $scope.selectedPaletteNode =  (node && node["nodeModel"]) ? node : null;
    };

    $scope.addAndCloseDialog = () => {
      if ($scope.selectedPaletteNode) {
        addNewNode($scope.selectedPaletteNode["nodeModel"]);
      }
      $scope.closeAddDialog();
    };

    $scope.camelSubLevelTabs = () => {
      return $scope.breadcrumbs;
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

    $scope.onNodeSelect = (folder, treeNode) => {
      $scope.selectedFolder = folder;
      $scope.treeNode = treeNode;
      $scope.propertiesTemplate = null;
      $scope.diagramTemplate = null;
      $scope.nodeXmlNode = null;
      var routeXmlNode = folder["routeXmlNode"];
      if (routeXmlNode) {
        $scope.nodeXmlNode = routeXmlNode;
        $scope.nodeData = Camel.getRouteNodeJSON(routeXmlNode);
        $scope.nodeDataChangedFields = {};
        var nodeName = routeXmlNode.localName;
        $scope.nodeModel = Camel.getCamelSchema(nodeName);
        if ($scope.nodeModel) {
          $scope.propertiesTemplate = "app/wiki/html/camelPropertiesEdit.html";
        }
        $scope.diagramTemplate = "app/camel/html/routes.html";
        Core.$apply($scope);
      }
    };

    $scope.$on("hawtio.form.modelChange", onModelChangeEvent);

    updateView();

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
      var selectedFolder = $scope.selectedFolder;
      if ($scope.treeNode && selectedFolder) {
        var routeXmlNode = selectedFolder["routeXmlNode"];
        if (routeXmlNode) {
          var nodeName = routeXmlNode.localName;
          var nodeSettings = Camel.getCamelSchema(nodeName);
          if (nodeSettings) {
            // redraw the title
            selectedFolder.title = Camel.getRouteNodeLabel(routeXmlNode, nodeSettings);
            $scope.treeNode.render(false, false);
          }
        }
        //$scope.treeNode.reloadChildren(function (node, isOk) {});
      }

    }

    function onNodeDataChanged() {
      if ($scope.nodeXmlNode) {
        Camel.setRouteNodeJSON($scope.nodeXmlNode, $scope.nodeData);
      }
    }

    function onResults(response) {
      var text = response.text;
      if (text) {
        var tree = Camel.loadCamelTree(text);
        if (tree) {
          tree.key = $scope.pageId + "_camelContext";
          $scope.camelContextTree = tree;
        }
      } else {
        console.log("No XML found for page " + $scope.pageId);
      }
      Core.$applyLater($scope);
    }

    function updateView() {
      $scope.pageId = Wiki.pageId($routeParams, $location);
      console.log("Has page id: " + $scope.pageId + " with $routeParams " + JSON.stringify($routeParams));

      $scope.breadcrumbs = [
        {
          content: '<i class=" icon-edit"></i> Properties',
          title: "View the pattern properties",
          isValid: (workspace:Workspace) => true,
          href: () => "#/wiki/camel/properties/" + $scope.pageId
        },
        {
          content: '<i class="icon-picture"></i> Diagram',
          title: "View a diagram of the route",
          isValid: (workspace:Workspace) => true,
          href: () => "#/wiki/camel/diagram/" + $scope.pageId
        }
      ];

      if (Git.getGitMBean(workspace)) {
        $scope.git = wikiRepository.getPage($scope.pageId, $scope.objectId, onResults);
      }
    }

    function addNewNode(nodeModel) {
      var parentFolder = ($scope.selectedFolder) ? $scope.selectedFolder: $scope.camelContextTree;
      var key = nodeModel["_id"];
      if (!key) {
        console.log("WARNING: no id for model " + JSON.stringify(nodeModel));
      } else {
        var treeNode = $scope.treeNode;
        if (key === "route") {
          // lets add to the tree
          parentFolder = $scope.camelContextTree;
          treeNode = treeNode.getParent();
        }
        var node = $("<" + key + "/>")[0];
        $(parentFolder["routeXmlNode"]).append(node);
        var addedNode = Camel.addRouteChild(parentFolder, node);
        console.log("Added node: " + addedNode);

        if (treeNode && addedNode) {
          var added = treeNode.addChild(addedNode);
          console.log("Added is " + added);
          if (added) {
            added.expand(true);
            added.select(true);
            added.activate(true);
          }

          //$scope.treeNode.reloadChildren(function (node, isOk) {});
        }
      }
    }
  }
}
