module Dashboard {
  export function DashboardController($scope, $routeParams, workspace:Workspace, jolokia) {
    $scope.id = $routeParams["dashboardId"];

  }
}