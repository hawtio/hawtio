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
      { id: "w1", title: "Operating System", row: 1, col: 1,
        path: "jmx/attributes",
        include: "app/jmx/html/attributes.html",
        search: {nid: "root-java.lang-OperatingSystem"},
        hash: ""
      },
      { id: "w2", title: "Broker", row: 1, col: 2,
        path: "jmx/attributes",
        include: "app/jmx/html/attributes.html",
        search: {nid: "root-org.apache.activemq-broker1-Broker"},
        hash: ""
      }
      /*,
      { id: "w3", title: "Cheese Widget", row: 1, col: 1,
        path: "jmx/cheese",
        include: "app/jmx/html/cheese.html",
        search: {}, hash: ""}
        */
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
        console.log("About to create a child scope...");
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