/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.PropertiesController", ["$scope", "workspace", ($scope, workspace:Workspace) => {
    $scope.viewTemplate = null;
    $scope.schema = _apacheCamelModel;

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
        $scope.model = getCamelSchema(nodeName);

        if ($scope.model) {
          console.log("data is: " + JSON.stringify($scope.nodeData, null, "  "));
          console.log("model schema is: " + JSON.stringify($scope.model, null, "  "));

          $scope.viewTemplate = "app/camel/html/nodePropertiesView.html";
        }
      }
    }
  }]);
}



