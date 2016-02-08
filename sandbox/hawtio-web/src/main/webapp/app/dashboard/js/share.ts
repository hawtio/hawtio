/**
 * @module Dashboard
 */
/// <reference path="dashboardPlugin.ts"/>
module Dashboard {
  export var ShareController = _module.controller("Dashboard.ShareController", ["$scope", "$location", "$routeParams", "workspace", "dashboardRepository", ($scope, $location, $routeParams, workspace:Workspace, dashboardRepository:DashboardRepository) => {
    var id = $routeParams["dashboardId"];
    dashboardRepository.getDashboard(id, onDashboardLoad);

    var options = {
      mode: {
          name: "javascript"
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

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
  }]);
}
