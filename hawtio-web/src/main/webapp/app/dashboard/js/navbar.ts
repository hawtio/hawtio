module Dashboard {
  export function NavBarController($scope, $routeParams, $location, workspace:Workspace,
                                   dashboardRepository: DashboardRepository) {

    $scope.activeDashboard = $routeParams['dashboardId'];
    $scope.dashboards = [];

    $scope.isActive = (dash) => {
      return workspace.isLinkActive("#/dashboard/id/" + dash.id);
    };

    $scope.onTabRenamed = function(dash) {
      dashboardRepository.addDashboards([dash], Dashboard.onOperationComplete);
    };

    // Lets asynchronously load the dashboards on startup...
    setTimeout(updateData, 100);

    function updateData() {
      dashboardRepository.getDashboards(dashboardLoaded);
    }

    function dashboardLoaded(dashboards) {
      $scope.dashboards = dashboards;
      Core.$apply($scope);
    }
  }
}
