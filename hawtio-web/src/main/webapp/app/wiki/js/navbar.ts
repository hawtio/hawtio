module Wiki {
  export function NavBarController($scope, $location, $routeParams,
                                      workspace:Workspace,
                                      wikiRepository: GitWikiRepository) {

    $scope.editLink = () => {
      var pageId = $routeParams["page"];
      if (pageId) {
        return "#/wiki/edit/" + pageId;
      }
      // lets use the current path
      var path = $location.path();
      return path.replace("/view", "/edit");
    };
  }
}