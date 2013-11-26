/**
 * @module Maven
 */
module Maven {

  export function DependenciesController($scope, $routeParams, $location, workspace:Workspace, jolokia) {
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

    $scope.onSelectNode = (node) => {
       $scope.selected = node;
    };

    $scope.onRootNode = (rootNode) => {
       // process the rootNode
    };

    $scope.validSelection = () => {
      return $scope.selected && $scope.selected !== $scope.rootDependency;
    };

    $scope.viewDetails = () => {
      var dependency = Core.pathGet($scope.selected, ["dependency"]);
      var link = $scope.detailLink(dependency);
      if (link) {
        var path = Core.trimLeading(link,  "#");
        console.log("going to view " + path);
        $location.path(path);
      }
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
          $scope.rootDependency = $scope.dependencyTree.children[0];
        }
      }
      Core.$apply($scope);
    }

    function addChildren(folder, dependency) {
      var name = Maven.getName(dependency);
      var node = new Folder(name);
      node.key = name.replace(/\//g, '_');
      node["dependency"] = dependency;
      $scope.dependencyActivations.push(node.key);

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
