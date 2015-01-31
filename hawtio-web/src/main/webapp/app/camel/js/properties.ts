/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.PropertiesController", ["$scope", "workspace", "localStorage", ($scope, workspace:Workspace, localStorage:WindowLocalStorage) => {
    var log:Logging.Logger = Logger.get("Camel");

    $scope.showHelp = Camel.showEIPDocumentation(localStorage);
    $scope.showUsedOnly = Camel.hideUnusedEIP(localStorage);

    $scope.viewTemplate = null;
    $scope.schema = _apacheCamelModel;
    $scope.model = null;
    $scope.labels = [];
    $scope.nodeData = null;
    $scope.icon = null;

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

    $scope.showEntity = function(id) {
      log.debug("Show entity: " + id);

      if ($scope.showUsedOnly) {
        // figure out if there is any data for the id
        var value = Core.pathGet($scope.nodeData, id);
        if (angular.isUndefined(value) || Core.isBlank(value)) {
          return false;
        }
        if (angular.isString(value)) {
          var aBool = "true" === value || "false" == value;
          if (aBool) {
            // hide false booleans
            return Core.parseBooleanValue(value);
          }
          // to show then must not be blank
          return !Core.isBlank(value);
        }
      }

      return true;
    };

    function updateData() {
      var routeXmlNode = getSelectedRouteNode(workspace);
      if (routeXmlNode != null) {
        $scope.model = getCamelSchema(routeXmlNode.nodeName);

        if ($scope.model) {
          if (log.enabledFor(Logger.DEBUG)) {
            log.debug("Properties - data: " + JSON.stringify($scope.nodeData, null, "  "));
            log.debug("Properties - schema: " + JSON.stringify($scope.model, null, "  "));
          }
          // labels is named group in camelModel.js
          var labels = [];
          if ($scope.model.group) {
            labels = $scope.model.group.split(",");
          }
          $scope.labels = labels;
          $scope.nodeData = getRouteNodeJSON(routeXmlNode);
          $scope.icon = getRouteNodeIcon(routeXmlNode);
          $scope.viewTemplate = "app/camel/html/nodePropertiesView.html";
        }
      }
    }
  }]);
}



