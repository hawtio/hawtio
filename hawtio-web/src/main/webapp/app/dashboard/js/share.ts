module Dashboard {
  export function ShareController($scope, $location, $routeParams, workspace:Workspace, dashboardRepository:DashboardRepository) {
    var id = $routeParams["dashboardId"];
    dashboardRepository.getDashboard(id, onDashboardLoad);

    function onDashboardLoad(dashboard) {
      $scope.dashboard = Dashboard.cleanDashboardData(dashboard);

      $scope.json = {
        "description": "hawtio dashboards",
        "public": true,
        "files": {
          "dashboards.json": {
            "content": JSON.stringify($scope.dashboard, null, "  ")
          }
        }
      };

      $scope.source = JSON.stringify($scope.dashboard, null, "  ");
      Core.$applyNowOrLater($scope);
    }
  }
}
