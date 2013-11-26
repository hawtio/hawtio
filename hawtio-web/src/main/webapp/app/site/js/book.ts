/**
 * @module Site
 */
module Site {

  export function BookController($scope, $routeParams, $location, $compile, $http, fileExtensionTypeRegistry) {

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

    log.info("Loading page '" + $scope.pageId + "'");

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
