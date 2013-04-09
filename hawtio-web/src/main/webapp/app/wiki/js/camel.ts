module Wiki {

  export function CamelController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {
    $scope.schema = _apacheCamelModel;

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

    $scope.onNodeSelect = (treeNode) => {
      $scope.propertiesTemplate = null;
      $scope.nodeXmlNode = null;
      var routeXmlNode = treeNode["routeXmlNode"];
      if (routeXmlNode) {
        $scope.nodeXmlNode = routeXmlNode;
        $scope.nodeData = Camel.getRouteNodeJSON(routeXmlNode);
        $scope.nodeDataChangedFields = {};
        var nodeName = routeXmlNode.nodeName;
        $scope.nodeModel = Camel.getCamelSchema(nodeName);
        if ($scope.nodeModel) {
          $scope.propertiesTemplate = "app/wiki/html/camelPropertiesEdit.html";
        }
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
  }
}
