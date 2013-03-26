module Wiki {
  export function NavBarController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {

    $scope.createLink = () => Wiki.createLink(Wiki.pageId($routeParams, $location), $location, $scope);

    $scope.sourceLink = () => {
      var path = $location.path();
      var prefix = "/wiki/formTable";
      if (path.startsWith(prefix)) {
        return Core.createHref($location, "#/wiki/view" + path.substring(prefix.length))
      }
      // remove the form parameter on view/edit links
      return ($location.search()["form"])
              ? Core.createHref($location, "#" + path, ["form"])
              : null;
    };

    $scope.isActive = (href) => {
      var tidy = Core.trimLeading(href, "#");
      var loc = $location.path();
      if (loc === tidy) return true;
      if (loc.startsWith("/wiki/view") || loc.startsWith("/wiki/edit")) {
        var p1 = Wiki.pageIdFromURI(tidy);
        var p2 = Wiki.pageIdFromURI(loc);
        return p1 === p2;
      }
      return false;
    };

    loadBreadcrumbs();


    function loadBreadcrumbs() {
      var href = "#/wiki/view/";
      $scope.breadcrumbs = [
        {href: href, name: "/"}
      ];
      var path = Wiki.pageId($routeParams, $location);
      var array = path ? path.split("/") : [];
      angular.forEach(array, (name) => {
        if (!name.startsWith("/") && !href.endsWith("/")) {
          href += "/";
        }
        href += name;
        $scope.breadcrumbs.push({href: href, name: name});
      });
      var loc = $location.path();
      if (loc.startsWith("/wiki/history") || loc.startsWith("/wiki/version") || loc.startsWith("/wiki/diff")) {
        // lets add a history tab
        $scope.breadcrumbs.push({href: "#/wiki/history/" + path, name: "History"});
      }
      if (loc.startsWith("/wiki/version")) {
        // lets add a version tab
        var name = ($routeParams["objectId"] || "").substring(0, 6) || "Version";
        $scope.breadcrumbs.push({href: "#" + loc, name: name});
      }
      if (loc.startsWith("/wiki/diff")) {
        // lets add a version tab
        var v1 = ($routeParams["objectId"] || "").substring(0, 6);
        var v2 = ($routeParams["baseObjectId"] || "").substring(0, 6);
        var name = "Diff";
        if (v1) {
          if (v2) {
            name += " " + v1 + " " + v2;
          } else {
            name += " " + v1;
          }
        }
        $scope.breadcrumbs.push({href: "#" + loc, name: name});
      }
      Core.$apply($scope);
    }
  }
}