module Dashboard {
  export function DashboardController($scope, $location, $routeParams, $injector, $route, $templateCache, workspace:Workspace, jolokia) {
    $scope.id = $routeParams["dashboardId"];
    $scope.route = $route;
    $scope.injector = $injector;

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateWidgets, 50);
    });

    $scope.widgets = [
      { id: "w2", title: "Cheese Widget", row: 1, col: 1,
        path: "jmx/cheese",
        include: "app/jmx/html/cheese.html",
        search: {}, hash: ""},
      { id: "w1", title: "Attributes", row: 1, col: 2,
        path: "jmx/attributes",
        include: "app/jmx/html/attributes.html",
        search: {nid: "root-java.lang-OperatingSystem"},
        hash: ""
      }
    ];

    $scope.sizex = (widget) => {
      return widget['sizex'] || 1;
    };

    $scope.sizey = (widget) => {
      return widget['sizey'] || 1;
    };


    function updateWidgets() {
      var widgets = $("#widgets");
      var template = $templateCache.get("widgetTemplate");
      angular.forEach($scope.widgets, (widget) => {
        var childScope = $scope.$new(false);
        childScope.widget = widget;
        var path = widget.path;
        var search = widget.search;
        var hash = widget.hash;
        var location = new RectangleLocation($location, path, search, hash);

        workspace.$location = location;
        // now we need to update the selection from the location search()
        var key = location.search()['nid'];
        if (key && workspace.tree) {
          // lets find the node for this key...
          workspace.selection = workspace.keyToNodeMap[key];
          console.log("Selected node " + workspace.selection);
        }

        childScope["$location"] = location;
        childScope["$routeParams"] = {x: "123", y: "Cheese!"};

        var div = $('<li data-row="' + widget.row + '" data-col="' + widget.col + '" data-sizex="' + $scope.sizex(widget) + '" data-sizey="' + $scope.sizey(widget) + '">');
        div.html(template);
        workspace.$compile(div.contents())(childScope);
        widgets.append(div);
      });
      $scope.$apply();

      // TODO we can destroy all the child scopes now?
      widgets.gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [400, 300]
      });
    }
  }
}