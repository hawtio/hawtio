
module Source {

  export function IndexController($scope, $location, $routeParams, workspace:Workspace, jolokia) {

    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.mavenCoords = $routeParams["mavenCoords"];
    var fileName = $scope.pageId || "/";

    $scope.loadingMessage = "Loading source code from artifacts <b>" + $scope.mavenCoords + "</b>";

    $scope.breadcrumbs = [];

    // TODO load breadcrumbs
    // $scope.breadcrumbs.push({href: "#" + loc, name: name});

    $scope.$watch('workspace.tree', function () {
      if (!$scope.git && Git.getGitMBean(workspace)) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        //console.log("Reloading the view as we now seem to have a git mbean!");
        setTimeout(updateView, 50);
      }
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    function viewContents(response) {
      if (response) {
        $scope.sourceFiles = response.split("\n").map(n => n.trim()).filter(n => n);
      } else {
        $scope.sourceFiles = [];
      }
      $scope.loadingMessage = null;
      if (!response) {
        var time = new Date().getTime();
        if (!$scope.lastErrorTime || time - $scope.lastErrorTime > 3000) {
          $scope.lastErrorTime = time;
          notification("error", "Could not download the source code for the maven artifacts: " + $scope.mavenCoords);
        }
      }
      Core.$apply($scope);
    }

    function updateView() {
      var mbean = Source.getInsightMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, "getSource", $scope.mavenCoords, null, fileName, onSuccess(viewContents));
      }
    }
  }
}