module Core {

  export function NavBarController($scope, $location:ng.ILocationService, workspace:Workspace, $route) {

    $scope.hash = null;
    $scope.topLevelTabs = [];

    $scope.topLevelTabs = () => {
      reloadPerspective();
      // TODO transform the top level tabs based on the current perspective

      // TODO watch for changes to workspace.topLevelTabs and for the current perspective
      return workspace.topLevelTabs;
    };

    $scope.subLevelTabs = () => workspace.subLevelTabs;

    $scope.validSelection = (uri) => workspace.validSelection(uri);

    $scope.isValid = (nav) => nav && nav.isValid(workspace);

    // when we change the view/selection lets update the hash so links have the latest stuff
    $scope.$on('$routeChangeSuccess', function () {
      $scope.hash = workspace.hash();

      reloadPerspective();
    });

    /*
    $scope.$watch('hash', function() {
      console.log("$scope.hash: ", $scope.hash);
      console.log("$location:", $location);
      console.log("viewRegistry:", viewRegistry);
    });
    */

    $scope.link = (nav) => {
      var href;
      if (angular.isString(nav)) {
        href = nav;
      }else {
        href = nav.href();
      }
      return createHref($location, href, ['tab', 'nid']);
    };

    $scope.fullScreenLink = () => {
      var href = "#" + $location.path() + "?tab=notree";
      return createHref($location, href, ['tab']);
    };

    $scope.addToDashboardLink = () => {
      var href = "#" + $location.path() + workspace.hash();
      return "#/dashboard/add?tab=dashboard&href=" + encodeURIComponent(href);
    };

    $scope.isActive = (nav) => {
      if (angular.isString(nav))
        return workspace.isLinkActive(nav);
      var fn = nav.isActive;
      if (fn) {
        return fn(workspace);
      }
      return workspace.isLinkActive(nav.href());
    };

    $scope.isTopTabActive = (nav) => {
      if (angular.isString(nav))
        return workspace.isTopTabActive(nav);
      var fn = nav.isActive;
      if (fn) {
        return fn(workspace);
      }
      return workspace.isTopTabActive(nav.href());
    };

    $scope.activeLink = () => {
      var tabs = $scope.topLevelTabs();
      if (!tabs) {
        return "Loading...";
      }
      var tab = tabs.find(function(nav) {
        return $scope.isActive(nav);
      });
      return tab ? tab['content'] : "";
    };

    function reloadPerspective() {
      var perspective = $location.search()["_p"];
      if (!perspective) {
        perspective = Perspective.choosePerspective($location, workspace);
      }
      console.log("perspective: " + perspective);
      var data = perspective ? Perspective.metadata[perspective] : null;
      if (!data) {
        $scope.topLevelTabs = workspace.topLevelTabs;
      } else {
        $scope.topLevelTabs = [];
        // lets iterate through the available tabs in the perspective
        var topLevelTabs = data.topLevelTabs;
        var list = topLevelTabs.includes || topLevelTabs.excludes;
        angular.forEach(list, (tabSpec) => {
          var href = tabSpec.href;
          if (href) {
            var tab = workspace.topLevelTabs.find((t) => {
              var thref = t.href();
              return thref && thref.startsWith(href);
            });
            if (tab) {
              $scope.topLevelTabs.push(tab);
            }
          }
        });
        if (!topLevelTabs.includes) {
          // lets exclude the matched tabs
          $scope.topLevelTabs = workspace.topLevelTabs.subtract($scope.topLevelTabs);
        }
      }
    }

    reloadPerspective();
  }
}
