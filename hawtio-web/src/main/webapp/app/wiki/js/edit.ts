module Wiki {
  export function EditController($scope, $location, $routeParams,
                                      wikiRepository: GitWikiRepository) {

    $scope.pageId = $routeParams['page'];

    wikiRepository.getPage($scope.pageId, (contents) => {
      $scope.source = contents;
      Core.$apply($scope);
    });

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
      wikiRepository.putPage($scope.pageId, $scope.source, commitMessage, onComplete);
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