module Dashboard {
  export function DashboardController($scope, $routeParams, $templateCache, workspace:Workspace, jolokia) {
    $scope.id = $routeParams["dashboardId"];

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateWidgets, 50);
    });

    $scope.widgets = [
/*
      { id: "w1", title: "First Widget", row: 1, col: 1, content: "<h1>Some content!</h1>"},
      { id: "w2", title: "Second Widget", row: 1, col: 2, content: "<h1>Moar content!</h1>"}
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
        var childScope = $scope.$new(false);
        childScope.widget = widget;
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