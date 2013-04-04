module Camel {

  export function PropertiesController($scope, workspace:Workspace) {
    $scope.viewTemplate = null;

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateData, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      updateData();
    });

    function updateData() {
      var routeXmlNode = getSelectedRouteNode(workspace);
      $scope.nodeData = getRouteNodeJSON(routeXmlNode);

      if (routeXmlNode) {
        var nodeName = routeXmlNode.nodeName;
        $scope.schema = getCamelSchema(nodeName);

        if ($scope.schema) {
          console.log("data is: " + JSON.stringify($scope.nodeData, null, "  "));
          console.log("schema is: " + JSON.stringify($scope.schema, null, "  "));

          // TODO as a little hack for now lets use the edit form
          //$scope.viewTemplate = "app/camel/html/nodePropertiesView.html";
          $scope.viewTemplate = "app/camel/html/nodePropertiesEdit.html";
        }
      }
    }
  }
}



