/**
 * @module Source
 */
/// <reference path="./sourcePlugin.ts"/>
module Source {

  _module.controller("Source.SourceController", ["$scope", "$location", "$routeParams", "workspace", "fileExtensionTypeRegistry", "jolokia", ($scope, $location, $routeParams, workspace:Workspace, fileExtensionTypeRegistry, jolokia) => {

    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
    var lineNumber = $location.search()["line"] || 1;
    var mavenCoords = $routeParams["mavenCoords"];
    var className = $routeParams["className"] || "";
    var fileName = $scope.pageId || "/";
    var classNamePath = className.replace(/\./g, '/');

    $scope.loadingMessage = "Loading source code for class <b>" + className + "</b> from artifacts <b>" + mavenCoords + "</b>";

    //console.log("Source format is " + $scope.format + " line " + lineNumber + " className " + className + " file " + fileName);

    $scope.breadcrumbs = [];

    var idx = fileName.lastIndexOf('/');
    var path = "/";
    var name = fileName;
    if (idx > 0) {
      path = fileName.substring(0, idx);
      name = fileName.substring(idx + 1);
    } else if (className && className.indexOf('.') > 0) {
      path = classNamePath;
      idx = path.lastIndexOf('/');
      if (idx > 0) {
        name = path.substring(idx + 1);
        path = path.substring(0, idx);
      }
    }
    $scope.breadcrumbs = Source.createBreadcrumbLinks(mavenCoords, path);
    $scope.breadcrumbs.push({href: $location.url(), name: name, active: true});

    $scope.javaDocLink = () => {
      var path = classNamePath;
      if (!path && fileName && fileName.endsWith(".java")) {
        path = fileName.substring(0, fileName.length - 5);
      }
      if (path) {
        return "javadoc/" + encodeURIComponent(mavenCoords) + "/" + path + ".html";
      }
      return null;
    };

    function updateLineSelection() {
      var codeMirror = $scope.codeMirror;
      if (codeMirror && lineNumber) {
        var line = lineNumber - 1;
        var lineText = codeMirror.getLine(line);
        var endChar = (lineText) ? lineText.length : 1000;
        var start = {line: line, ch: 0};
        var end = {line: line, ch: endChar};
        codeMirror.scrollIntoView(start);
        codeMirror.setCursor(start);
        codeMirror.setSelection(start, end);
        codeMirror.refresh();
        codeMirror.focus();
      }
    }

    $scope.$watch('workspace.tree', function (oldValue, newValue) {
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

    function viewContents(response) {
      if (response) {
        log.debug("Downloaded file for the maven artifact: " + mavenCoords);
        $scope.source = response;
        $scope.loadingMessage = null;
      } else {
        // we could not download the source code
        $scope.source = null;
        $scope.loadingMessage = "Cannot download file, please see logging console for details.";
        log.error("Failed to download the source code for the Maven artifact: ", mavenCoords);
      }
      Core.$apply($scope);

      // lets update the line selection asynchronously to check we've properly loaded by now
      setTimeout(updateLineSelection, 100);
    }

    function updateView() {
      var mbean = Source.getInsightMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, "getSource", encodeURIComponent(mavenCoords), className, fileName, {
          success: viewContents,
          error: (response) => {
            log.error("Failed to download the source code for the Maven artifact: ", mavenCoords);
            log.info("Stack trace: ", response.stacktrace);
            $scope.loadingMessage = "Cannot not download file, please see logging console for details.";
            Core.$apply($scope);
          }
        });
      }
    }

    var maybeUpdateView = Core.throttled(updateView, 1000);
     setTimeout(maybeUpdateView, 50);
  }]);
}
