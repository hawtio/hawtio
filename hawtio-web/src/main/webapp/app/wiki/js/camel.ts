module Wiki {

  export function CamelController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {
    $scope.pageId = Wiki.pageId($routeParams, $location);

    $scope.camelSubLevelTabs = () => {
      return [
        {
          content: '<i class=" icon-edit"></i> Properties',
          title: "View the pattern properties",
          isValid: (workspace:Workspace) => true,
          href: () => "#/wiki/camel/properties"
        },
        {
          content: '<i class="icon-picture"></i> Diagram',
          title: "View a diagram of the route",
          isValid: (workspace:Workspace) => true,
          href: () => "#/wiki/camel/diagram"
        }
      ];
    };

    $scope.$watch('workspace.tree', function () {
      if (!$scope.git && Git.getGitMBean(workspace)) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        //console.log("Reloading the view as we now seem to have a git mbean!");
        setTimeout(updateView, 50);
      }
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    updateView();

    function onResults(response) {
      var text = response.text;
      if (text) {
        var tree = Camel.loadCamelTree(text);
        if (tree) {
          tree.key = $scope.pageId + "_camelContext";

          var treeElement = $("#camelxml");
          Jmx.enableTree($scope, $location, workspace, treeElement, [tree]);
        }
      }
      Core.$apply($scope);
    }

    function updateView() {
      $scope.git = wikiRepository.getPage($scope.pageId, $scope.objectId, onResults);
    }
  }
}
