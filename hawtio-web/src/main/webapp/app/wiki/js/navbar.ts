module Wiki {
  export function NavBarController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {

    $scope.editLink = () => {
      var pageId = $routeParams["page"];
      if (pageId) {
        return "#/wiki/edit/" + pageId;
      }
      // lets use the current path
      var path = $location.path();
      return path.replace("/view", "/edit");
    };

    $scope.createLink = () => {
      var pageId = $routeParams["page"];
      var link = null;
      if (pageId) {
        link = "#/wiki/create/" + pageId;
      } else {
        // lets use the current path
        var path = $location.path();
        link = path.replace("/(edit|view)", "/create");
      }
      // we have the link so lets now remove the last path
      console.log("create link is " + link);
      return link;
    };
  }
}