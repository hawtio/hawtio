/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.PropertiesController", ["$scope", "workspace", ($scope, workspace:Workspace) => {
    var log:Logging.Logger = Logger.get("Camel");

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
      if (routeXmlNode != null) {
        log.debug("Properties - Selected node " + routeXmlNode.nodeName);
      }
      $scope.nodeData = getRouteNodeJSON(routeXmlNode);

      if (routeXmlNode) {
        var nodeName = routeXmlNode.nodeName;
        $scope.model = getCamelSchema(nodeName);

        if ($scope.model) {
          if (log.enabledFor(Logger.DEBUG)) {
            log.debug("Properties - data: " + JSON.stringify($scope.nodeData, null, "  "));
            log.debug("Properties - schema: " + JSON.stringify($scope.model, null, "  "));
          }

          $scope.viewTemplate = "app/camel/html/nodePropertiesView.html";
        }
      }
    }
  }]);
}



