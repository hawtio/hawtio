module Core {

  export function NavBarController($scope, $location:ng.ILocationService, workspace:Workspace, $route, jolokia, localStorage) {

    $scope.hash = null;
    $scope.topLevelTabs = [];
    $scope.perspectiveDetails = {
      perspective: null
    };

    $scope.topLevelTabs = () => {
      reloadPerspective();
      // TODO transform the top level tabs based on the current perspective

      // TODO watch for changes to workspace.topLevelTabs and for the current perspective
      return workspace.topLevelTabs;
    };

    $scope.subLevelTabs = () => workspace.subLevelTabs;

    $scope.validSelection = (uri) => workspace.validSelection(uri);

    $scope.isValid = (nav) => nav && nav.isValid(workspace);

    $scope.$watch('perspectiveDetails.perspective', function() {
      var perspective = $scope.perspectiveDetails.perspective;
      if (perspective) {
        console.log("Changed the perspective to " + JSON.stringify(perspective));
        $location.search(Perspective.perspectiveSearchId, perspective.id);
        reloadPerspective();
      }
    });

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
      $scope.perspectives = Perspective.getPerspectives($location, workspace, jolokia, localStorage);

      console.log("Current perspectives " + JSON.stringify($scope.perspectives));
      var currentId = Perspective.currentPerspectiveId($location, workspace, jolokia, localStorage);
      $scope.perspectiveDetails.perspective = $scope.perspectives.find({id: currentId});
      console.log("Current perspective ID: " + currentId + " perspective: " + $scope.perspective);
      $scope.topLevelTabs = Perspective.topLevelTabs($location, workspace, jolokia, localStorage);
    }

    reloadPerspective();
  }
}
