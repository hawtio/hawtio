module Dashboard {
  export function DashboardController($scope, $location, $routeParams, $injector, $route,
                                      $templateCache,
                                      workspace:Workspace,
                                      dashboardRepository: DashboardRepository,
                                      jolokia) {
    $scope.id = $routeParams["dashboardId"];
    $scope.route = $route;
    $scope.injector = $injector;

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateWidgets, 50);
    });

    $scope.sizex = (widget) => {
      return widget['sizex'] || 1;
    };

    $scope.sizey = (widget) => {
      return widget['sizey'] || 1;
    };

    function updateWidgets() {
      dashboardRepository.getDashboard($scope.id, onDashboardLoad);
    }

    function onDashboardLoad(dashboard) {
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

        var div = $('<li data-row="' + widget.row + '" data-col="' + widget.col + '" data-sizex="' + $scope.sizex(widget) + '" data-sizey="' + $scope.sizey(widget) + '">');
        div.html(template);
        workspace.$compile(div.contents())(childScope);
        widgetElement.append(div);
        $scope.$apply();
      });
      // TODO we can destroy all the child scopes now?
      widgetElement.gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [400, 300]
      });
      $scope.$apply();
    }
  }
}
