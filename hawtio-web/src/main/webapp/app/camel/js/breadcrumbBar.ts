module Camel {

  export function BreadcrumbBarController($scope, $routeParams, workspace:Workspace, jolokia) {
    $scope.workspace = workspace;
    var routeContextId = $routeParams["contextId"];
    var routeEndpointName = $routeParams["endpointPath"];
    $scope.contextId = routeContextId;
    $scope.endpointPath = routeEndpointName;
    $scope.endpointName = formatEndpointName(routeEndpointName);

    $scope.isJmxTab = !routeContextId || !routeEndpointName;

    $scope.breadcrumbs = {
      endpoints: findEndpoints()
    };

    // lets find all the endpoints for the given context id

    function findEndpoints() {
      var answer = [];
      var contextId = $scope.contextId;
      var contextFolder = Camel.getCamelContextFolderFolder(workspace, contextId);
      if (contextFolder) {
        var endpoints = (contextFolder["children"] || []).find((n) => "endpoints" === n.title);
        if (endpoints) {
          angular.forEach(endpoints.children, (endpointFolder) => {
            var entries = endpointFolder ? endpointFolder.entries : null;
            if (entries) {
              var endpointPath = entries["name"];
              if (endpointPath) {
                var name = formatEndpointName(endpointPath);
                var link = linkToBrowseEndpointFullScreen(contextId, endpointPath);

                answer.push({
                  contextId: contextId,
                  path: endpointPath,
                  name: name,
                  link: link
                });
              }
            }
          });
        }
      }
      return answer;
    }
  }

  function formatEndpointName(endpointPath) {
    return endpointPath ? trimQuotes(endpointPath) : endpointPath;
  }
}
