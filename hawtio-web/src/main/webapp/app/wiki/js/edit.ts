module Wiki {
  export function EditController($scope, $location, $routeParams,
                                      wikiRepository: GitWikiRepository) {

    $scope.pageId = $routeParams['page'];

    wikiRepository.getPage($scope.pageId, (contents) => {
      $scope.source = contents;
      Core.$apply($scope);
    });

    var options = {
      mode: {
        name: "markdown"
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    $scope.isValid = () => true;

    $scope.viewLink = () => {
      var pageId = $scope.pageId;
      if (pageId) {
        return "#/wiki/view/" + pageId;
      }
      // lets use the current path
      var path = $location.path();
      return path.replace("/edit", "/view");
    };

    $scope.cancel = () => {
      goToView();
    };

    $scope.save = () => {
      var commitMessage = $scope.commitMessage || "Updated page";
      var contents = $scope.source;

      // lets convert multiple lines into an array...
      //contents = contents.split("\n");
      if (angular.isArray(contents)) {
        contents = contents.join("\n");
      }
      if (contents.indexOf('\n') >= 0) {
        contents = contents.replace(/\n/g, '\\n');
        // lets wrap in single quotes
        //contents = "'" + contents + "'";
        if (!contents.startsWith('"') && !contents.endsWith('"')) {
          contents = '"' + contents + '"';
        }
      }
      console.log("About to write contents '" + contents + "'");
      wikiRepository.putPage($scope.pageId, contents, commitMessage, onComplete);
      goToView();
    };

    function goToView() {
      var path = Core.trimLeading($scope.viewLink(), "#");
      $location.path(path);
    }

    function onComplete(status) {
      console.log("Completed operation with status: " + JSON.stringify(status));
    }
  }
}