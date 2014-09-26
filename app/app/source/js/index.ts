/**
 * @module Source
 */
/// <reference path="./sourcePlugin.ts"/>
module Source {

  _module.controller("Source.IndexController", ["$scope", "$location", "$routeParams", "workspace", "jolokia", ($scope, $location, $routeParams, workspace:Workspace, jolokia) => {

    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.mavenCoords = $routeParams["mavenCoords"];
    var fileName = $scope.pageId;
    if (fileName === '/') {
      fileName = undefined;
    }

    $scope.loadingMessage = "Loading source code from artifacts <b>" + $scope.mavenCoords + "</b>";

    createBreadcrumbs();

    $scope.setFileName = (breadcrumb) => {
      fileName = Core.trimLeading(breadcrumb.fileName, "/");
      fileName = Core.trimLeading(fileName, "/");
      console.log("selected fileName '" + fileName + "'");
      createBreadcrumbs();
      filterFileNames();
    };

    $scope.$watch('workspace.tree', function (newValue, oldValue) {
      if (!$scope.git && Git.getGitMBean(workspace)) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        //console.log("Reloading the view as we now seem to have a git mbean!");
        setTimeout(maybeUpdateView, 50);
      }
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(maybeUpdateView, 50);
    });

    function filterFileNames() {
      if (fileName) {
        $scope.sourceFiles = $scope.allSourceFiles.filter(n => n && n.startsWith(fileName)).map(n => n.substring(fileName.length + 1)).filter(n => n);
      } else {
        $scope.sourceFiles = $scope.allSourceFiles;
      }
    }

    $scope.sourceLinks = (aFile) => {
      var name = aFile;
      var paths = null;
      var idx = aFile.lastIndexOf('/');
      if (idx > 0) {
        name = aFile.substring(idx + 1);
        paths = aFile.substring(0, idx);
      }
      var answer = "";
      var fullName = fileName || "";
      if (paths) {
        angular.forEach(paths.split("/"), (path) => {
          if (fullName) {
            fullName += "/";
          }
          fullName += path;
          answer += "<a href='#/source/index/" + $scope.mavenCoords + "/" + fullName + "'>" + path + "</a>/"
        });
      }
      answer += "<a href='#/source/view/" + $scope.mavenCoords + "/" + fullName + "/" + name + "'>" + name + "</a>";
      return answer;
    };

    function createBreadcrumbs() {
      $scope.breadcrumbs = Source.createBreadcrumbLinks($scope.mavenCoords, fileName);
      angular.forEach($scope.breadcrumbs, (breadcrumb) => {
        breadcrumb.active = false;
      });
      $scope.breadcrumbs.last().active = true;
    }

    function viewContents(response) {
      if (response) {
        $scope.allSourceFiles = response.split("\n").map(n => n.trim()).filter(n => n);
      } else {
        $scope.allSourceFiles = [];
      }
      filterFileNames();
      $scope.loadingMessage = null;
      Core.$apply($scope);
    }

    function updateView() {
      if (!$scope.mavenCoords) {
        return;
      }
      var mbean = Source.getInsightMBean(workspace);
      log.debug("In update view, mbean: ", mbean);
      if (mbean) {
        jolokia.execute(mbean, "getSource", $scope.mavenCoords, null, "/", {
          success: viewContents,
          error: (response) => {
            log.error("Failed to download the source code for the maven artifact: ", $scope.mavenCoords);
            log.info("Stack trace: ", response.stacktrace);
            $scope.loadingMessage = "Could not download index, please see console for details"
            Core.$apply($scope);
          }
        });
      }
    }

    var maybeUpdateView = Core.throttled(updateView, 1000);
    setTimeout(maybeUpdateView, 50);

  }]);
}
