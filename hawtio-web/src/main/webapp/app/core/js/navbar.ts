module Core {

  export function NavBarController($scope, $location:ng.ILocationService, workspace:Workspace, $route, jolokia, localStorage) {

    $scope.hash = workspace.hash();
    $scope.topLevelTabs = [];
    $scope.subLevelTabs = workspace.subLevelTabs;
    $scope.currentPerspective = null;
    $scope.perspectiveDetails = {
      perspective: null
    };

    $scope.topLevelTabs = () => {
      reloadPerspective();
      // TODO transform the top level tabs based on the current perspective

      // TODO watch for changes to workspace.topLevelTabs and for the current perspective
      return workspace.topLevelTabs;
    };


    $scope.$on('jmxTreeUpdated', function () {
      reloadPerspective();
    });

    //$scope.subLevelTabs = () => workspace.subLevelTabs;

    $scope.validSelection = (uri) => workspace.validSelection(uri);

    $scope.isValid = (nav) => nav && nav.isValid(workspace);

    $scope.switchPerspective = (perspective) => {
      var searchPerspectiveId = $location.search()[Perspective.perspectiveSearchId];
      if (perspective && ($scope.currentPerspective !== perspective ||  perspective.id !== searchPerspectiveId)) {
        Logger.debug("Changed the perspective to " + JSON.stringify(perspective) + " from search id " + searchPerspectiveId);
        if ($scope.currentPerspective) {
          $scope.currentPerspective.lastPage = $location.url();
        }
        var pid = perspective.id;
        $location.search(Perspective.perspectiveSearchId, pid);
        Logger.debug("Setting perspective to " + pid);
        $scope.currentPerspective = perspective;
        reloadPerspective();
        $scope.topLevelTabs = Perspective.topLevelTabs($location, workspace, jolokia, localStorage);
        if (perspective.lastPage) {
          var path = Core.trimLeading(perspective.lastPage, "#");
          // lets avoid any old paths with ?p=" inside
          var idx = path.indexOf("?p=") || path.indexOf("&p=");
          if (idx > 0) {
            path = path.substring(0, idx);
          }
          var sep = (path.indexOf("?") >= 0) ? "&" : "?";
          path += sep + "p=" + pid;
          $location.url(path);
        }
      }
    };

    $scope.$watch('hash', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("hash changed from ", oldValue, " to ", newValue);
      }
    });

    // when we change the view/selection lets update the hash so links have the latest stuff
    $scope.$on('$routeChangeSuccess', function () {
      $scope.hash = workspace.hash();
      reloadPerspective();
    });

    $scope.link = (nav) => {
      var href;
      if (angular.isString(nav)) {
        href = nav;
      }else {
        href = nav.href();
      }
      var removeParams = ['tab', 'nid'];
      if (href.indexOf("?p=") >= 0 || href.indexOf("&p=") >= 0) {
        removeParams.push("p");
      }
      return createHref($location, href, removeParams);
    };

    $scope.fullScreenLink = () => {
      var href = "#" + $location.path() + "?tab=notree";
      return createHref($location, href, ['tab']);
    };

    $scope.addToDashboardLink = () => {
      var href = "#" + $location.path() + workspace.hash();

      var answer =  "#/dashboard/add?tab=dashboard&href=" + encodeURIComponent(href);

      if ($location.url().has("/jmx/charts")) {
        var size = {
          size_x: 4,
          size_y: 3
        }

        answer += "&size=" + encodeURIComponent(angular.toJson(size));
      }

      return answer;
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
      var perspectives = Perspective.getPerspectives($location, workspace, jolokia, localStorage);
      var currentId = Perspective.currentPerspectiveId($location, workspace, jolokia, localStorage);

      console.log("reloading perspectives for " + currentId);

      if (currentId != $scope.perspectiveId || angular.toJson($scope.perspectives) !== angular.toJson(perspectives)) {
        $scope.perspectiveId = currentId;
        $scope.perspectives = perspectives;
        $scope.perspectiveDetails.perspective = $scope.perspectives.find((p) => {
          return p['id'] === currentId;
        });
        console.log("Current perspective ID: " + currentId);
        $scope.topLevelTabs = Perspective.topLevelTabs($location, workspace, jolokia, localStorage);
      }
    }

    //reloadPerspective();
  }
}
