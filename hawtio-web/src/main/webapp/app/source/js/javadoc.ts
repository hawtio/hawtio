/**
 * @module Source
 */
/// <reference path="./sourcePlugin.ts"/>
module Source {

  _module.controller("Source.JavaDocController", ["$scope", "$location", "$routeParams", "workspace", "fileExtensionTypeRegistry", "jolokia", ($scope, $location, $routeParams, workspace:Workspace, fileExtensionTypeRegistry, jolokia) => {
    $scope.pageId = Wiki.pageId($routeParams, $location);
    var mavenCoords = $routeParams["mavenCoords"];
    var fileName = $scope.pageId;

    $scope.loadingMessage = "Loading javadoc code for file <b>" + fileName + "</b> from artifacts <b>" + mavenCoords + "</b>";

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
      $scope.source = response;
      $scope.loadingMessage = null;
      if (!response) {
        var time = new Date().getTime();
        if (!$scope.lastErrorTime || time - $scope.lastErrorTime > 3000) {
          $scope.lastErrorTime = time;
          Core.notification("error", "Could not download the source code for the maven artifacts: " + mavenCoords);
        }
      }
      Core.$apply($scope);
    }

    function updateView() {
      var mbean = Source.getInsightMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, "getJavaDoc", mavenCoords, fileName, onSuccess(viewContents));
      }
    }
  }]);
}
