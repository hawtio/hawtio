module Wiki {
  export function ViewController($scope, $location, $routeParams,
                                      workspace:Workspace,
                                      marked,
                                      wikiRepository: GitWikiRepository) {

    $scope.pageId = $routeParams['page'];

    wikiRepository.getPage($scope.pageId, (contents) => {

      var name = $scope.pageId;
      var extension = "";
      var idx = name.lastIndexOf(".");
      if (idx > 0) {
        extension = name.substring(idx + 1, name.length).toLowerCase();
      }

      if (extension.length === 0 || extension === "md" || extension === "markdown") {
        // lets convert it to HTML
        $scope.html = marked(contents);

      } else {
        $scope.html = contents;
      }

      Core.$apply($scope);
    });

  }
}