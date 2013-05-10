module Maven {

  export function DependenciesController($scope, $routeParams, workspace:Workspace, jolokia) {
    $scope.artifacts = [];
    $scope.group = $routeParams["group"] || "";
    $scope.artifact = $routeParams["artifact"] || "";
    $scope.version = $routeParams["version"] || "";
    $scope.classifier = $routeParams["classifier"] || "";
    $scope.packaging = $routeParams["packaging"] || "";

    $scope.dependencyTree = null;

    addMavenFunctions($scope, workspace);

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      updateTableContents();
    });

    $scope.onSelectNode = (rootNode) => {
       // process the rootNode
    };

    $scope.onRootNode = (rootNode) => {
       // process the rootNode
    };

    function updateTableContents() {
      var mbean = Maven.getAetherMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, "resolveJson(java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String)",
                $scope.group, $scope.artifact, $scope.version, $scope.packaging, $scope.classifier,
                onSuccess(render));
      } else {
        console.log("No AetherMBean!");
      }
    }

    function render(response) {
      if (response) {
        var json = JSON.parse(response);
        if (json) {
          //console.log("Found json: " + JSON.stringify(json, null, "  "));
          $scope.dependencyTree = new Folder("Dependencies");
          $scope.dependencyActivations = [];
          addChildren($scope.dependencyTree, json);
          $scope.dependencyActivations.reverse();
        }
      }
      Core.$apply($scope);
    }

    function addChildren(folder, dependency) {
      var title = Maven.getName(dependency);
      var node = new Folder(title);
      node.key = title;
      $scope.dependencyActivations.push(title);

/*
      var imageUrl = Camel.getRouteNodeIcon(value);
      node.icon = imageUrl;
      //node.tooltip = tooltip;
*/

      folder.children.push(node);

      var children = dependency["children"];
      angular.forEach(children, (child) => {
        addChildren(node, child);
      });
    }
  }
}
