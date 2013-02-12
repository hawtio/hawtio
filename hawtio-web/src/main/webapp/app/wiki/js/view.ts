module Wiki {
  export function ViewController($scope, $location, $routeParams,
                                      workspace:Workspace,
                                      wikiRepository: GitWikiRepository) {

    $scope.pageId = $routeParams['page'];

    wikiRepository.getPage($scope.pageId, (contents) => {
      $scope.source = contents;
      Core.$apply($scope);
    });

  }
}