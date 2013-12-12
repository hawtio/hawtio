/**
 * @module Site
 */
module Site {

  export function PageController($scope, $routeParams, $location, $compile, $http, fileExtensionTypeRegistry) {

    var log:Logging.Logger = Logger.get("Site");
    var pageId = $routeParams["page"];
    if (!pageId) {
      pageId = "README.md";
/*
      $location.path("/site/doc/index.md");
      return;
*/
    }

    if (!pageId.startsWith("/") && pageId.indexOf(":/") < 0 && pageId.indexOf("app/site/") < 0) {
      // lets assume the page is relative to app/site/
      pageId = "app/site/" + pageId;
    }
    $scope.pageId = pageId;
    $scope.pageFolder = pageId.substring(0, pageId.lastIndexOf('/') + 1);

    log.info("Loading page '" + $scope.pageId + "'");

    $scope.getContents = (filename, cb) => {
      var fullPath = $scope.pageFolder + filename;
      log.info("Loading the contents of: " + fullPath);
      $http.get(fullPath).success(cb).error(() => cb(" "));
    };

    $http.get($scope.pageId).success(onResults);

    function onResults(contents, status, headers, config) {
      $scope.contents = contents;
      $scope.html = contents;

      var format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry) || "markdown";
      if ("markdown" === format) {
        // lets convert it to HTML
        $scope.html = contents ? marked(contents) : "";
      } else if (format && format.startsWith("html")) {
        $scope.html = contents;
      } else {
        // TODO?
      }
      $compile($scope.html)($scope);
      Core.$apply($scope);
    }
  }
}
