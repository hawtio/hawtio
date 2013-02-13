module Wiki {
  export function NavBarController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {

    $scope.editLink = () => Wiki.editLink(Wiki.pageId($routeParams, $location), $location);

    $scope.createLink = () => Wiki.createLink(Wiki.pageId($routeParams, $location), $location);

    $scope.isActive = (href) => {
      var tidy = Core.trimLeading(href, "#");
      return $location.path() === tidy;
    };

    loadBreadcrumbs();

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(loadBreadcrumbs, 50);
    });

    function loadBreadcrumbs() {
      $scope.breadcrumbs = [];
      var path = Wiki.pageId($routeParams, $location);
      var array = path.split("/");
      if (array.length < 2 || array[0] !== "/") {
        array.splice(0, 0, "/");
      }
      var href = "#/wiki/view";
      angular.forEach(array, (name) => {
        if (!name.startsWith("/") && !href.endsWith("/")) {
          href += "/";
        }
        href += name;
        $scope.breadcrumbs.push({href: href, name: name});
      });
      Core.$apply($scope);
    }
  }
}