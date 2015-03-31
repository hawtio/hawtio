/**
 * @module Dashboard
 */
/// <reference path="dashboardPlugin.ts"/>
module Dashboard {
  _module.controller("Dashboard.NavBarController", ["$scope", "$routeParams", "$rootScope", "workspace", "dashboardRepository", "$location", "$timeout", ($scope, $routeParams, $rootScope, workspace:Workspace, dashboardRepository: DefaultDashboardRepository, $location:ng.ILocationService, $timeout) => {

    $scope.hash = workspace.hash();
    $scope._dashboards = [];
    $scope.edit = false;

    $scope.activeDashboard = $routeParams['dashboardId'];

    $rootScope.$on('loadDashboards', loadDashboards);

    $rootScope.$on('dashboardsUpdated', dashboardLoaded);

    $scope.navigateTo = (url) => {
      if (!$scope.edit) {
        $location.url(url);
      }
    };

    $scope.$on('editablePropertyEdit', (ev, edit) => {
      // to change the value after original click even finishes propagation
      // if changing here to false, $cope.navigateTo() would be called when closing the editable-property
      $timeout(() => {
        $scope.edit = edit;
      }, 0, false);
    });

    $scope.dashboards = () => {
      return $scope._dashboards
    };

    $scope.isActive = (dash) => {
      return workspace.isLinkActive("#/dashboard/id/" + dash.id);
    };


    $scope.isEditing = () => {
      return workspace.isLinkActive("#/dashboard/edit");
    };

    $scope.onTabRenamed = function(dash) {
      dashboardRepository.putDashboards([dash], "Renamed dashboard", (dashboards) => {
        dashboardLoaded(null, dashboards);
      });
    };

    function dashboardLoaded(event, dashboards) {
      log.debug("navbar dashboardLoaded: ", dashboards);
      $scope._dashboards = dashboards;
      if (event === null) {
        $rootScope.$broadcast('dashboardsUpdated', dashboards);
        Core.$apply($scope);
      }
    }

    function loadDashboards(event) {
      dashboardRepository.getDashboards((dashboards) => {
        // prevent the broadcast from happening...
        dashboardLoaded(event, dashboards);
        Core.$apply($scope);
      });
    }
  }]);
}
