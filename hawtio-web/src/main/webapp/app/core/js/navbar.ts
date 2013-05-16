module Core {

  export function NavBarController($scope, $location:ng.ILocationService, workspace:Workspace, $document, pageTitle, localStorage) {

    $scope.hash = null;

    $scope.topLevelTabs = () => workspace.topLevelTabs;

    $scope.subLevelTabs = () => workspace.subLevelTabs;

    $scope.validSelection = (uri) => workspace.validSelection(uri);

    $scope.isValid = (nav) => nav && nav.isValid(workspace);

    // when we change the view/selection lets update the hash so links have the latest stuff
    $scope.$on('$routeChangeSuccess', function () {
      $scope.hash = workspace.hash();
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
      return createHref($location, href, ['tab']);
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

  }
}
