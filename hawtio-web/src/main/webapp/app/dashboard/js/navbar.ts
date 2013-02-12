module Dashboard {
  export function NavBarController($scope, $routeParams, $location, workspace:Workspace,
                                   dashboardRepository: DashboardRepository) {

    $scope.activeDashboard = $routeParams['dashboardId'];
    $scope.dashboards = [];

    $scope.isActive = (dash) => {
      return workspace.isLinkActive("#/dashboard/id/" + dash.id);
    };

    function dashboardLoaded(dashboards) {
      $scope.dashboards = dashboards;
    }

    $scope.onTabRenamed = function(dash) {
      dashboardRepository.addDashboards([dash], Dashboard.onAddDashboard);
    };

    dashboardRepository.getDashboards(dashboardLoaded);
  }
}
