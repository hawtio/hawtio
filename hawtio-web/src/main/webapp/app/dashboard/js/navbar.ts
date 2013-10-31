module Dashboard {
  export function NavBarController($scope, $routeParams, $rootScope, workspace:Workspace,
                                   dashboardRepository: DefaultDashboardRepository) {

    $scope.hash = workspace.hash();
    $scope._dashboards = [];

    $scope.activeDashboard = $routeParams['dashboardId'];

    $rootScope.$on('loadDashboards', loadDashboards);

    $rootScope.$on('dashboardsUpdated', dashboardLoaded);

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
  }
}
