/**
 * @module Maven
 */
/// <reference path="./mavenPlugin.ts"/>
module Maven {

  _module.controller("Maven.ArtifactController", ["$scope", "$routeParams", "workspace", "jolokia", ($scope, $routeParams, workspace:Workspace, jolokia) => {
    $scope.row = {
      groupId: $routeParams["group"] || "",
      artifactId: $routeParams["artifact"] || "",
      version: $routeParams["version"] || "",
      classifier: $routeParams["classifier"] || "",
      packaging: $routeParams["packaging"] || ""
    };
    var row = $scope.row;

    $scope.id = getName(row);

    addMavenFunctions($scope, workspace);

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      updateTableContents();
    });

    function updateTableContents() {
      var mbean = Maven.getMavenIndexerMBean(workspace);

      // lets query the name and description of the GAV
      if (mbean) {
        jolokia.execute(mbean, "search",
                row.groupId, row.artifactId, row.version, row.packaging, row.classifier, "",
                onSuccess(render));
      } else {
        console.log("No MavenIndexerMBean!");
      }
    }

    function render(response) {
      if (response && response.length) {
        var first = response[0];
        row.name = first.name;
        row.description = first.description;
      }
      Core.$apply($scope);
    }
  }]);
}
