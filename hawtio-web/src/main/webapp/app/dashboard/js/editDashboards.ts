module Dashboard {
  export function EditDashboardsController($scope, $routeParams, $route, $location, workspace:Workspace, dashboardRepository:DashboardRepository, jolokia) {
    $scope.searchText = "";
    $scope.selectedItems = [];

    updateData();

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
      selectWithCheckboxOnly: true,
      columnDefs: [
        {
          field: 'title',
          displayName: 'Dashboard',
          cellTemplate: '<div class="ngCellText"><a ng-href="#/dashboard/id/{{row.getProperty(' + "'id'" + ')}}{{hash}}">{{row.getProperty(col.field)}}</a></div>'
        },
        {
          field: 'group',
          displayName: 'Group'
        }
      ]
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateData, 50);
    });

    $scope.$watch('workspace.selection', function () {
      setTimeout(updateData, 50);
    });

    $scope.goBack = () => {
      var href = Core.trimLeading($scope.url, "#");
      if (href) {
        console.log("Going back to url: " + href);
        $location.url(href);
      }
    };

    $scope.addViewToDashboard = () => {
      angular.forEach($scope.selectedItems, (selectedItem) => {
        console.log("$route " + $route);
        var text = $scope.url;
        if (text) {
          var idx = text.indexOf('?');
          if (idx) {
            text = text.substring(0, idx);
          }
          text = Core.trimLeading(text, "#");
        }
        // TODO capture the query arguments...
        var search = {};
        console.log("path is: " + text);
        if ($route && $route.routes) {
          var value = $route.routes[text];
          if (value) {
            /*
             angular.forEach($route.routes, (value, key) => {
             if (key === text) {
             */
            console.log("===== FOUND ROUTE: " + JSON.stringify(value));
            var templateUrl = value["templateUrl"];
            if (templateUrl) {
              if (!selectedItem.widgets) {
                selectedItem.widgets = [];
              }
              var nextNumber = selectedItem.widgets.length + 1;
              var widget = {
                id: "w" + nextNumber, title: "Untitled" + nextNumber, row: nextNumber, col: 1,
                path: Core.trimLeading(text, "/"),
                include: templateUrl,
                search: search,
                hash: ""
              };
              selectedItem.widgets.push(widget);
            }
          } else {
            // TODO we need to be able to match URI templates...
          }
        }
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

    function updateData() {
      var url = $routeParams["href"];
      if (url) {
        $scope.url = decodeURIComponent(url);
      }
      dashboardRepository.getDashboards(dashboardLoaded);
    }

    function dashboardLoaded(dashboards) {
      $scope.dashboards = dashboards;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    }
  }
}