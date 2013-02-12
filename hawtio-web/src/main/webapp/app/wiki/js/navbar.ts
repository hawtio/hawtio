module Wiki {
  export function NavBarController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {

    $scope.editLink = () => Wiki.editLink($routeParams["page"], $location);

    $scope.createLink = () => Wiki.createLink($routeParams["page"], $location);
  }
}