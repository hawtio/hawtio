module Dashboard {
  export function NavBarController($scope, workspace:Workspace,
                                   dashboardRepository: DashboardRepository, jolokia) {
    $scope.dashboards = [];

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateData, 50);
    });

    $scope.isActive = (dash) => {
      return workspace.isLinkActive("#/dashboard/" + dash.id);
    };

    function updateData() {
      dashboardRepository.getDashboards(dashboardLoaded);
    }

    function dashboardLoaded(dashboards) {
      $scope.dashboards = dashboards;
      $scope.$apply();
    }
  }
}