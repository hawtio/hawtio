module Dashboard {
  export function EditDashboardsController($scope, $routeParams, $location, workspace:Workspace, jolokia) {
    var url = $routeParams["url"];
    if (url) {
      $scope.url = decodeURIComponent(url);
    }
    $scope.searchText = "";
    $scope.selectedItems = [];

    $scope.hasUrl = () => {
      return ($scope.url) ? true : false;
    };

    $scope.hasSelection = () => {
      return !$scope.selectedItems.length;
    };

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

    $scope.$watch('workspace.selection', function () {
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

    $scope.addViewToDashboard = () => {
      angular.forEach($scope.selectedItems, (selectedItem) => {
        console.log("Adding url " + $scope.url + " to dashboard: " + JSON.stringify(selectedItem));
      });
    };

    function addDashboard(newDash) {
        // TODO how to really add??

      $scope.dashboards.push(newDash);
      $scope.selectedItems.push(newDash);
    }

    $scope.create = () => {
      var counter = $scope.dashboards.length + 1;
      var id = "dash" + (counter);
      var newDash = {id: id, title: "Untitled" + counter, group: "Personal", widgets: []};

      // TODO how to really add??
      addDashboard(newDash);
    };

    $scope.duplicate = () => {
      angular.forEach($scope.selectedItems, (item, idx) => {
        // lets unselect this item
        $scope.selectedItems = $scope.selectedItems.splice(idx, 1);
        var counter = $scope.dashboards.length + 1;
        var id = "dash" + (counter);
        var widgets = item.widgets || [];
        var newDash = {id: id, title: item.title + " Copy", group: item.group, widgets: widgets };
        addDashboard(newDash);
      });
    };

    $scope.delete = () => {
      angular.forEach($scope.selectedItems, (item) => {
        $scope.dashboards.remove(item);
      });
      $scope.selectedItems.splice(0, $scope.selectedItems.length);
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