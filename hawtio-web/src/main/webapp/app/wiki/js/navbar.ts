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


    function switchToFormTableLink(breadcrumb) {
      var href = breadcrumb.href;
      if (href) {
        breadcrumb.href = href.replace("wiki/view", "wiki/formTable");
      }
    }

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
      // lets swizzle the last one or two to be formTable views if the last or 2nd to last

      var loc = $location.path();
      if (loc.startsWith("/wiki/formTable") && $scope.breadcrumbs.length) {
        // lets swizzle the view to a formTable link
        switchToFormTableLink($scope.breadcrumbs.last());
      } else if ($location.search()["form"] && $scope.breadcrumbs.length) {
        var lastName = $scope.breadcrumbs.last().name;
        if (lastName && lastName.endsWith(".json")) {
          // previous breadcrumb should be a formTable
          switchToFormTableLink($scope.breadcrumbs[$scope.breadcrumbs.length - 2]);
        }
      }
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