module Dashboard {
  export function NavBarController($scope, workspace:Workspace,
                                   dashboardRepository: DashboardRepository, jolokia) {

    // TODO need to do this to get things to work if navigating from home page
    // I'm guessing since its not using $routeProvider but we are using the
    // ng-include layout approach?

    // lets do this asynchronously to avoid Error: $digest already in progress
    setTimeout(updateData, 50);

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
      console.log("Loaded dashboards " + $scope.dashboards.length);
      $scope.$apply();
    }
  }
}