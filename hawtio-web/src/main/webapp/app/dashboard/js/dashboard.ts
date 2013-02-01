module Dashboard {
  export function DashboardController($scope, $location, $routeParams, $injector, $route,
                                      $templateCache,
                                      workspace:Workspace,
                                      dashboardRepository: DashboardRepository,
                                      jolokia) {
    $scope.route = $route;
    $scope.injector = $injector;

    updateWidgets();

/*
    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      console.log("dashboard changed with $routeParams " + JSON.stringify($routeParams));
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateWidgets, 50);
    });
*/

    $scope.onWidgetRenamed = function(widget) {
      // TODO - deal with renamed widget here
      console.log("Widget renamed to : " + widget.title);
    };

    function updateWidgets() {
      $scope.id = $routeParams["dashboardId"];
      $scope.idx = $routeParams["dashboardIndex"];
      if ($scope.id) {
        dashboardRepository.getDashboard($scope.id, onDashboardLoad);
      } else {
        dashboardRepository.getDashboards((dashboards) => {
          var idx = $scope.idx ? parseInt($scope.idx) : 0;
          var id = null;
          if (dashboards.length > 0) {
            var dashboard = dashboards.length > idx ? dashboards[idx] : dashboard[0];
            id = dashboard.id;
          }
          if (id) {
            $location.path("/dashboard/id/" + id);
          } else {
            $location.path("/dashboard/edit?tab=dashboard");
          }
          //$scope.$apply();
        });
      }
    }

    function onDashboardLoad(dashboard) {
      $scope.dashboard = dashboard;
      var widgetElement = $("#widgets");
      var template = $templateCache.get("widgetTemplate");
      var widgets = ((dashboard) ? dashboard.widgets : null) || [];
      angular.forEach(widgets, (widget) => {
        var childScope = $scope.$new(false);
        childScope.widget = widget;
        var path = widget.path;
        var search = widget.search;
        var hash = widget.hash;
        var location = new RectangleLocation($location, path, search, hash);

        var childWorkspace = workspace.createChildWorkspace(location);
        //var childWorkspace = workspace;
        childWorkspace.$location = location;

        // now we need to update the selection from the location search()
        var key = location.search()['nid'];
        if (key && workspace.tree) {
          // lets find the node for this key...
          childWorkspace.selection = workspace.keyToNodeMap[key];
          console.log("Selected node " + childWorkspace.selection);
        }

        var $$scopeInjections = {
          workspace: childWorkspace,
          location: location,
          $location: location,
          $routeParams: {x: "123", y: "Cheese!"}
        };
        childScope.$$scopeInjections = $$scopeInjections;

        if (!widget.sizex) {
          widget.sizex = 1;
        }
        if (!widget.sizey) {
          widget.sizey = 1;
        }
        var div = $('<li data-row="' + widget.row + '" data-col="' + widget.col + '" data-sizex="' + widget.sizex + '" data-sizey="' + widget.sizey + '">');
        div.html(template);
        workspace.$compile(div.contents())(childScope);
        widgetElement.append(div);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });

      // TODO we can destroy all the child scopes now?
      widgetElement.gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [400, 300],
        draggable: {
          stop: (event, ui) => {
            updateLayoutConfiguration();
          }
        }
      });

      function updateLayoutConfiguration() {
        var gridster = widgetElement.gridster().data('gridster');
        if (gridster) {
          var data = gridster.serialize();
          //console.log("got data: " + JSON.stringify(data));

          var widgets = $scope.dashboard.widgets || [];
          // lets assume the data is in the order of the widgets...
          angular.forEach(data, (value, idx) => {
            var widget = widgets[idx];
            if (widget) {
              // lets copy the values across
              angular.forEach(value, (attr, key) => widget[key] = attr);
            }
          });

          // TODO call the repository to update the dashboard JSON?
        }
      }
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    }
  }
}
