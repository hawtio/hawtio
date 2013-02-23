
module Source {

  export function SourceController($scope, $location, $routeParams, workspace:Workspace, fileExtensionTypeRegistry, jolokia) {

    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
    console.log("Source format is " + $scope.format);

    $scope.breadcrumbs = [];

    // TODO load breadcrumbs
    // $scope.breadcrumbs.push({href: "#" + loc, name: name});

    updateView();

    var options = {
      //readOnly: true,
      mode: {
        lineNumbers: true,
        matchBrackets: true,
        theme: "ambiance",
        name: $scope.format
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

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

    function viewContents(response) {
      $scope.source = response;
      Core.$apply($scope);
    }

    function updateView() {
      var mbean = Source.getInsightMBean(workspace);
      if (mbean) {
        var groupId = $routeParams["groupId"];
        var artifactId = $routeParams["artifactId"];
        var versionId = $routeParams["versionId"];
        jolokia.execute(mbean, "getArtifactSource", groupId, artifactId, versionId, $scope.pageId, onSuccess(viewContents));
      }
    }
  }
}