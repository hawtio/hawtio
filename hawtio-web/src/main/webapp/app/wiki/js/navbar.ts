module Wiki {
  export function NavBarController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {

    $scope.editLink = () => Wiki.editLink(Wiki.pageId($routeParams), $location);

    $scope.createLink = () => Wiki.createLink(Wiki.pageId($routeParams), $location);
  }
}