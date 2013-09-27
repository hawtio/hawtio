module Core {

  // NOTE - $route is brought in here to ensure the factory for that service
  // has been called, otherwise the ng-include directive doesn't show the partial
  // after a refresh until you click a top-level link.
  export function ViewController($scope, $route, $location:ng.ILocationService, layoutTree, layoutFull, viewRegistry) {

    findViewPartial();

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      findViewPartial();
    });

    function searchRegistry(path) {
      var answer = undefined;
      Object.extended(viewRegistry).keys(function (key, value) {
        if (!answer) {
          if (key.startsWith("/") && key.endsWith("/")) {
            // assume its a regex
            var text = key.substring(1, key.length - 1);
            try {
              var reg = new RegExp(text, "");
              if (reg.exec(path)) {
                answer = value;
              }
            } catch (e) {
              console.log("Invalid RegExp " + text + " for viewRegistry value: " + value);
            }
          } else {
            if (path.startsWith(key)) {
              answer = value;
            }
          }
        }
      });
      //console.log("Searching for: " + path + " returning: ", answer);
      return answer;
    }

    function findViewPartial() {

      var answer = null;
      var hash = $location.search();
      var tab = hash['tab'];
      if (angular.isString(tab)) {
        answer = searchRegistry(tab);
      }
      if (!answer) {
        var path = $location.path();
        if (path) {
          if (path.startsWith("/")) {
            path = path.substring(1);
          }
          answer = searchRegistry(path);
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
