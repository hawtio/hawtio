/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.PropertiesController", ["$scope", "workspace", ($scope, workspace:Workspace) => {
    var log:Logging.Logger = Logger.get("Camel");

    $scope.viewTemplate = null;
    $scope.schema = _apacheCamelModel;
    $scope.model = null;
    $scope.icon = null;
    $scope.showHelp = true;
    $scope.showUsedOnly = false;

    $scope.$watch('showHelp', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        updateData();
      }
    });

    $scope.$watch('showUsedOnly', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        updateData();
      }
    });

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
        $scope.model = getCamelSchema(routeXmlNode.nodeName);

        if ($scope.model) {
          if (log.enabledFor(Logger.DEBUG)) {
            log.debug("Properties - data: " + JSON.stringify($scope.nodeData, null, "  "));
            log.debug("Properties - schema: " + JSON.stringify($scope.model, null, "  "));
          }
          $scope.nodeData = getRouteNodeJSON(routeXmlNode);
          $scope.icon = getRouteNodeIcon(routeXmlNode);
          $scope.viewTemplate = "app/camel/html/nodePropertiesView.html";
        }
      }
    }
  }]);
}



