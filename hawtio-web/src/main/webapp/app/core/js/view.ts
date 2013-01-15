module Core {
  export var layoutTree = "app/core/html/layoutTree.html";
  export var layoutFull = "app/core/html/layoutFull.html";

  export function ViewController($scope, $location:ng.ILocationService, workspace:Workspace) {
    findViewPartial();

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      findViewPartial();
    });

    function findViewPartial() {
      var path = $location.path();
      $scope.viewPartial = layoutTree;
      if (path) {
        // TODO this should be inside the plugins!
        if (path.startsWith("/fabric")) {
          $scope.viewPartial = "app/fabric/html/layoutFabric.html";
        } else if (path.startsWith("/log") || path.startsWith("/health") || path.startsWith("/help") || path.startsWith("/preferences")) {
          $scope.viewPartial = layoutFull;
        }
      }
      console.log("path " + path + " and now view is " + $scope.viewPartial);
    }
  }
}