module Dashboard {
  export function NavBarController($scope, $routeParams, $location, workspace:Workspace,
                                   dashboardRepository: DashboardRepository) {

    $scope.activeDashboard = $routeParams['dashboardId'];
    $scope.dashboards = [];

    $scope.isActive = (dash) => {
      return workspace.isLinkActive("#/dashboard/" + dash.id);
    };

    function dashboardLoaded(dashboards) {
      $scope.dashboards = dashboards;
      if (!angular.isDefined($scope.activeDashboard) && $scope.dashboards.length > 0) {
        $location.path("/dashboard/" + $scope.dashboards[0].id);
      }
    }

    $scope.onTabRenamed = function(dash) {
      // TODO - Persist title change here, dash is the updated model
      console.log("Dashboard renamed to : " + dash.title);
    }

    dashboardRepository.getDashboards(dashboardLoaded);
  }
}
