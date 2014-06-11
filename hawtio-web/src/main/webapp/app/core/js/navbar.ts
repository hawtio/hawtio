/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
module Core {

  _module.controller("Core.NavBarController", ["$scope", "$location", "workspace", "$route", "jolokia", "localStorage", ($scope, $location:ng.ILocationService, workspace:Workspace, $route, jolokia, localStorage) => {

    $scope.hash = workspace.hash();
    $scope.topLevelTabs = [];
    $scope.subLevelTabs = workspace.subLevelTabs;
    $scope.currentPerspective = null;
    $scope.localStorage = localStorage;
    $scope.recentConnections = [];

    $scope.$watch('localStorage.recentConnections', (newValue, oldValue) => {
      $scope.recentConnections = Core.getRecentConnections(localStorage);
      log.debug("recent containers: ", $scope.recentConnections);
    });

    $scope.openConnection = (connection) => {
      window.open(connection.url);
    };

    $scope.goHome = () => {
      window.open(".");
    };

    $scope.clearConnections = Core.clearConnections;

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

    $scope.$watch('workspace.topLevelTabs', function () {
      reloadPerspective();
    });

    $scope.validSelection = (uri) => workspace.validSelection(uri);

    $scope.isValid = (nav) => nav && nav.isValid(workspace);

    $scope.switchPerspective = (perspective) => {
      if (perspective.onSelect && angular.isFunction(perspective.onSelect)) {
        perspective.onSelect.apply();
        return;
      }
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
        $scope.topLevelTabs = Perspective.getTopLevelTabsForPerspective($location, workspace, jolokia, localStorage);

        // is any of the top level tabs marked as default?
        var defaultPlugin = Core.getDefaultPlugin(pid, workspace, jolokia, localStorage);
        var defaultTab;
        var path;
        if (defaultPlugin) {
          $scope.topLevelTabs.forEach(tab => {
            if (tab.id === defaultPlugin.id) {
              defaultTab = tab;
            }
          });
          if (defaultTab) {
            path = Core.trimLeading(defaultTab.href(), "#");
          }
        } else {
          // if no default plugin configured, then select the last page as the active location
          if (perspective.lastPage) {
            path = Core.trimLeading(perspective.lastPage, "#");
          }
        }

        if (path) {
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

    // use includePerspective = false as default as that was the previous behavior
    $scope.link = (nav, includePerspective = false) => {
      var href;
      if (angular.isString(nav)) {
        href = nav;
      } else {
        href = nav.href();
      }
      var removeParams = ['tab', 'nid', 'chapter', 'pref', 'q'];
      if (!includePerspective) {
        if (href.indexOf("?p=") >= 0 || href.indexOf("&p=") >= 0) {
          removeParams.push("p");
        }
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
        };

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

      console.log("Reloading current perspective: " + currentId);

      // any tabs changed
      var newTopLevelTabs = Perspective.getTopLevelTabsForPerspective($location, workspace, jolokia, localStorage);
      var diff = newTopLevelTabs.subtract($scope.topLevelTabs);

      if (diff && diff.length > 0) {
        $scope.topLevelTabs = newTopLevelTabs;

        $scope.perspectiveId = currentId;
        $scope.perspectives = perspectives;
        $scope.perspectiveDetails.perspective = $scope.perspectives.find((p) => {
          return p['id'] === currentId;
        });

        console.log("Refreshing top level tabs for current perspective: " + currentId);
        // make sure to update the UI as the top level tabs changed
        Core.$apply($scope);
      }
    }
  }]);

}
