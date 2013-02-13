module Wiki {
  export function EditController($scope, $location, $routeParams, wikiRepository:GitWikiRepository) {

    $scope.pageId = $routeParams['page'];

    // only load the source if not in create mode
    if (!$location.path().startsWith("/wiki/create")) {
      wikiRepository.getPage($scope.pageId, (details) => {
        var contents = details.text;
        $scope.source = contents;
        Core.$apply($scope);
      });
    }

    // TODO pick the format based on the extension...
    var format = "markdown";

    var options = {
      mode: {
        name: format
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    $scope.isValid = () => true;

    $scope.viewLink = () => Wiki.viewLink($scope.pageId, $location, $scope.fileName);

    $scope.cancel = () => {
      goToView();
    };

    $scope.save = () => {
      saveTo($scope.pageId);
    };

    $scope.create = () => {
      // lets combine the file name with the current pageId (which is the directory)
      var path = $scope.pageId + "/" + $scope.fileName;
      console.log("creating new file at " + path);
      saveTo(path);
    };

    function goToView() {
      var path = Core.trimLeading($scope.viewLink(), "#");
      console.log("going to view " + path);
      $location.path(path);
    }

    function saveTo(path:string) {
      var commitMessage = $scope.commitMessage || "Updated page";
      var contents = $scope.source;
      //console.log("About to write contents '" + contents + "'");
      wikiRepository.putPage(path, contents, commitMessage, onComplete);
      goToView();
    }


    function onComplete(status) {
      console.log("Completed operation with status: " + JSON.stringify(status));
    }
  }
}