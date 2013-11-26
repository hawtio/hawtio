/**
 * @module Dashboard
 */
module Dashboard {
  export function ImportController($scope, $location, $routeParams, workspace:Workspace, dashboardRepository:DashboardRepository) {
    $scope.placeholder = "Paste the JSON here for the dashboard configuration to import...";
    $scope.source = $scope.placeholder;

    var options = {
      mode: {
        name: "javascript"
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    $scope.isValid = () => $scope.source && $scope.source !== $scope.placeholder;

    $scope.importJSON = () => {
      var json = [];
      // lets parse the JSON...
      try {
        json = JSON.parse($scope.source);
      } catch (e) {
        notification("error", "Could not parse the JSON\n" + e);
        json = [];
      }
      var array = [];
      if (angular.isArray(json)) {
        array = json;
      } else if (angular.isObject(json)) {
        array.push(json);
      }

      if (array.length) {
        // lets ensure we have some valid ids and stuff...
        angular.forEach(array, (dash, index) => {
          angular.copy(dash, dashboardRepository.createDashboard(dash));
        });
        dashboardRepository.putDashboards(array, "Imported dashboard JSON", Dashboard.onOperationComplete);
        $location.path("/dashboard/edit");
      }
    }
  }
}
