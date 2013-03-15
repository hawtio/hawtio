module Dashboard {
  export function NavBarController($scope, $routeParams, $location, workspace:Workspace,
                                   dashboardRepository: DefaultDashboardRepository) {

    $scope.activeDashboard = $routeParams['dashboardId'];
    $scope.dashboards = () => {
      return dashboardRepository.dashboards;
    };

    $scope.isActive = (dash) => {
      return workspace.isLinkActive("#/dashboard/id/" + dash.id);
    };

    $scope.isEditing = () => {
      return workspace.isLinkActive("#/dashboard/edit");
    }

    $scope.onTabRenamed = function(dash) {
      dashboardRepository.putDashboards([dash], "Renamed dashboard", Dashboard.onOperationComplete);
    };

    // Lets asynchronously load the dashboards on startup...
    setTimeout(updateData, 100);

    function updateData() {
      dashboardRepository.getDashboards(dashboardLoaded);
    }

    function dashboardLoaded(dashboards) {
      Core.$apply($scope);
    }
  }
}
