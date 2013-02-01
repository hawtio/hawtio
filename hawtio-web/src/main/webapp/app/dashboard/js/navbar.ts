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
      // TODO - Persist title change here, dash is the updated model
      console.log("Dashboard renamed to : " + dash.title);
    };

    dashboardRepository.getDashboards(dashboardLoaded);
  }
}
