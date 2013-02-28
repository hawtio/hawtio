
module Source {

  export function SourceController($scope, $location, $routeParams, workspace:Workspace, fileExtensionTypeRegistry, jolokia) {

    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
    var lineNumber = $location.search()["line"] || 1;

    console.log("Source format is " + $scope.format + " line " + lineNumber);

    $scope.breadcrumbs = [];

    // TODO load breadcrumbs
    // $scope.breadcrumbs.push({href: "#" + loc, name: name});

    updateView();

    var options = {
      readOnly: true,
      mode: {
        lineNumbers: true,
        cursor: lineNumber,
        name: $scope.format
      },
      // Quick hack to get the codeMirror instance.
      onChange: function(codeMirror) {
        if (codeMirror) {
          if (!$scope.codeMirror) {
            lineNumber -= 1;
            var lineText = codeMirror.getLine(lineNumber);
            var endChar = (lineText) ? lineText.length : 1000;
            var start = {line: lineNumber, ch: 0};
            var end = {line: lineNumber, ch: endChar};
            codeMirror.scrollIntoView(start);
            codeMirror.setCursor(start);
            codeMirror.setSelection(start, end);
            codeMirror.refresh();
            codeMirror.focus();
          }
          $scope.codeMirror = codeMirror;
        }
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    // TODO how to set the line number easily?

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
        var mavenCoords = $routeParams["mavenCoords"];
        var className = $routeParams["className"];
        var fileName = $scope.pageId;
        jolokia.execute(mbean, "getSource", mavenCoords, className, fileName, onSuccess(viewContents));
      }
    }
  }
}