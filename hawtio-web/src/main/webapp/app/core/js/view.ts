module Core {
  export var layoutTree = "app/core/html/layoutTree.html";
  export var layoutFull = "app/core/html/layoutFull.html";

  export function ViewController($scope, $location:ng.ILocationService, workspace:Workspace) {
    findViewPartial();

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      findViewPartial();
    });

    function findViewPartial() {
        // TODO this should be inside the plugins!
      function customView(path) {
        if (path.startsWith("integration")) {
          //$scope.viewPartial = "app/camel/html/layoutCamel.html";
          return "app/camel/html/layoutCamelTree.html";
        } else if (path.startsWith("fabric")) {
          return "app/fabric/html/layoutFabric.html";
        } else if (path.startsWith("osgi")) {
          return "app/osgi/html/layoutOsgi.html";
        } else if (path.startsWith("fullscreen") || path.startsWith("notree") || path.startsWith("log") || path.startsWith("health") || path.startsWith("help") || path.startsWith("preferences")) {
          return  layoutFull;
        } else {
          return null;
        }
      }

      var answer = null;
      var hash = $location.search();
      var tab = hash['tab'];
      if (angular.isString(tab)) {
        answer = customView(tab);
      } else {
        console.log("tab is not a string but is " + JSON.stringify(tab) + " for hash " + JSON.stringify(hash));
      }
      if (!answer) {
        var path = $location.path();
        if (path) {
          if (path.startsWith("")) {
            path = path.substring(1);
          }
          answer = customView(path);
        }
      }
      if (!answer) {
        answer = layoutTree;
      }
      $scope.viewPartial = answer;

      console.log("Using view partial: " + answer);
      return answer;
    }
  }
}