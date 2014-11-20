/**
 * @module Wiki
 */
/// <reference path="wikiPlugin.ts"/>
module Wiki {
  _module.controller("Wiki.NavBarController", ["$scope", "$location", "$routeParams", "workspace", "jolokia", "wikiRepository", "wikiBranchMenu", ($scope, $location, $routeParams, workspace:Workspace, jolokia, wikiRepository:GitWikiRepository, wikiBranchMenu:BranchMenu) => {

    var isFmc = Fabric.isFMCContainer(workspace);

    Wiki.initScope($scope, $routeParams, $location);
    $scope.branchMenuConfig = <UI.MenuItem>{
      title: $scope.branch,
      items: []
    };

    $scope.ViewMode = Wiki.ViewMode;
    $scope.setViewMode = (mode:Wiki.ViewMode) => {
      $scope.$emit('Wiki.SetViewMode', mode);
    };

    wikiBranchMenu.applyMenuExtensions($scope.branchMenuConfig.items);

    $scope.$watch('branches', (newValue, oldValue) => {
      if (newValue === oldValue || !newValue) {
        return;
      }
      $scope.branchMenuConfig.items = [];
      if (newValue.length > 0) {
        $scope.branchMenuConfig.items.push({
          heading: isFmc ? "Versions" : "Branches"
        });
      }
      newValue.sort().forEach((item) => {
        var menuItem = {
          title: item,
          icon: '',
          action: () => {}
        };
        if (item === $scope.branch) {
          menuItem.icon = "icon-ok";
        } else {
          menuItem.action = () => {
            var targetUrl = branchLink(item, <string>$scope.pageId, $location);
            $location.path(Core.toPath(targetUrl));
            Core.$apply($scope);
          }
        }
        $scope.branchMenuConfig.items.push(menuItem);
      });
      wikiBranchMenu.applyMenuExtensions($scope.branchMenuConfig.items);
    }, true);

    $scope.createLink = () => {
      var pageId = Wiki.pageId($routeParams, $location);
      return Wiki.createLink($scope.branch, pageId, $location, $scope);
    };

    $scope.startLink = startLink($scope.branch);

    $scope.sourceLink = () => {
      var path = $location.path();
      var answer = <string>null;
      angular.forEach(Wiki.customViewLinks($scope), (link) => {
        if (path.startsWith(link)) {
          answer = <string>Core.createHref($location, Wiki.startLink($scope.branch) + "/view" + path.substring(link.length))
        }
      });
      // remove the form parameter on view/edit links
      return (!answer && $location.search()["form"])
              ? Core.createHref($location, "#" + path, ["form"])
              : answer;
    };

    $scope.isActive = (href) => {
      if (!href) {
        return false;
      }
      return href.endsWith($routeParams['page']);
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(loadBreadcrumbs, 50);
    });

    loadBreadcrumbs();

    function switchFromViewToCustomLink(breadcrumb, link) {
      var href = breadcrumb.href;
      if (href) {
        breadcrumb.href = href.replace("wiki/view", link);
      }
    }

    function loadBreadcrumbs() {
      var start = Wiki.startLink($scope.branch);
      var href = start + "/view";
      $scope.breadcrumbs = [
        {href: href, name: "root"}
      ];
      var path = Wiki.pageId($routeParams, $location);
      var array = path ? path.split("/") : [];
      angular.forEach(array, (name) => {
        if (!name.startsWith("/") && !href.endsWith("/")) {
          href += "/";
        }
        href += Wiki.encodePath(name);
        if (!name.isBlank()) {
          $scope.breadcrumbs.push({href: href, name: name});
        }
      });
      // lets swizzle the last one or two to be formTable views if the last or 2nd to last
      var loc = $location.path();
      if ($scope.breadcrumbs.length) {
        var last = $scope.breadcrumbs[$scope.breadcrumbs.length - 1];
        // possibly trim any required file extensions
        last.name = Wiki.hideFileNameExtensions(last.name);

        var swizzled = false;
        angular.forEach(Wiki.customViewLinks($scope), (link) => {
          if (!swizzled && loc.startsWith(link)) {
            // lets swizzle the view to the current link
            switchFromViewToCustomLink($scope.breadcrumbs.last(), Core.trimLeading(link, "/"));
            swizzled = true;
          }
        });
        if (!swizzled && $location.search()["form"]) {
          var lastName = $scope.breadcrumbs.last().name;
          if (lastName && lastName.endsWith(".json")) {
            // previous breadcrumb should be a formTable
            switchFromViewToCustomLink($scope.breadcrumbs[$scope.breadcrumbs.length - 2], "wiki/formTable");
          }
        }
      }
      /*
      if (loc.startsWith("/wiki/history") || loc.startsWith("/wiki/version")
        || loc.startsWith("/wiki/diff") || loc.startsWith("/wiki/commit")) {
        // lets add a history tab
        $scope.breadcrumbs.push({href: "#/wiki/history/" + path, name: "History"});
      } else if ($scope.branch) {
        var prefix ="/wiki/branch/" + $scope.branch;
        if (loc.startsWith(prefix + "/history") || loc.startsWith(prefix + "/version")
          || loc.startsWith(prefix + "/diff") || loc.startsWith(prefix + "/commit")) {
          // lets add a history tab
          $scope.breadcrumbs.push({href: "#/wiki/branch/" + $scope.branch + "/history/" + path, name: "History"});
        }
      }
      */
      var name:string = null;
      if (loc.startsWith("/wiki/version")) {
        // lets add a version tab
        name = ($routeParams["objectId"] || "").substring(0, 6) || "Version";
        $scope.breadcrumbs.push({href: "#" + loc, name: name});
      }
      if (loc.startsWith("/wiki/diff")) {
        // lets add a version tab
        var v1 = ($routeParams["objectId"] || "").substring(0, 6);
        var v2 = ($routeParams["baseObjectId"] || "").substring(0, 6);
        name = "Diff";
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
  }]);
}
