module Dashboard {
  export function EditDashboardsController($scope, $routeParams, $location, workspace:Workspace, jolokia) {
    $scope.url = decodeURIComponent($routeParams["url"]);
    $scope.searchText = "";
    $scope.selectedItems = [];

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      showFilter: false,
      filterOptions: {
        filterText: "searchText"
      },
      data: 'dashboards',
      selectWithCheckboxOnly: true
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTable, 50);
    });

    $scope.goBack = () => {
      var href = $scope.url;
      if (href) {
        if (href.startsWith("#")) {
          href = href.substring(1);
        }
        console.log("Changing url to: " + url);
        $location.url(href);
      }
    };

    $scope.$watch('workspace.selection', function () {
      setTimeout(updateTable, 50);
    });

    $scope.add = () => {
      angular.forEach($scope.selectedItems, (selectedItem) => {
        console.log("Adding url " + $scope.url + " to dashboard: " + JSON.stringify(selectedItem));
      });
    };

    function updateTable() {
      // lets load the table of dashboards from some storage
      $scope.dashboards = [
        {id: "m1", title: "Monitor", group: "Personal"},
        {id: "t1", title: "Threading", group: "Admin"},
        {id: "c1", title: "Camel", group: "All"}
      ];
      dashboardLoaded();
    }

    function dashboardLoaded() {
      $scope.$apply();
    }

  }
}