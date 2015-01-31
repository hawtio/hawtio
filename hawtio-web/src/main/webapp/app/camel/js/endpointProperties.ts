/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.EndpointPropertiesController", ["$scope", "workspace", "localStorage", "jolokia", ($scope, workspace:Workspace, localStorage:WindowLocalStorage, jolokia) => {
    var log:Logging.Logger = Logger.get("Camel");

    $scope.showHelp = Camel.showEIPDocumentation(localStorage);
    $scope.showUsedOnly = Camel.hideUnusedEIP(localStorage);

    $scope.viewTemplate = null;
    $scope.schema = null;
    $scope.model = null;
    $scope.labels = [];
    $scope.nodeData = null;
    $scope.icon = null;
    $scope.endpointUrl = null;

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

    $scope.showEntity = function (id) {
      log.info("Show entity: " + id);
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
      var contextMBean = getSelectionCamelContextMBean(workspace);

      var endpointMBean:string = null;
      if ($scope.contextId && $scope.endpointPath) {
        var node = workspace.findMBeanWithProperties(Camel.jmxDomain, {
          context: $scope.contextId,
          type: "endpoints",
          name: $scope.endpointPath
        });
        if (node) {
          endpointMBean = node.objectName;
        }
      }
      if (!endpointMBean) {
        endpointMBean = workspace.getSelectedMBeanName();
      }
      if (endpointMBean && contextMBean) {
        // TODO: grab url from tree instead!
        var reply = jolokia.request({type: "read", mbean: endpointMBean, attribute: ["EndpointUri"]});
        var url:string = reply.value["EndpointUri"];
        if (url) {
          $scope.endpointUrl = url;
          log.info("Calling explainEndpointJson for url: " + url);
          var query = {type: 'exec', mbean: contextMBean, operation: 'explainEndpointJson(java.lang.String,boolean)', arguments: [url, true]};
          jolokia.request(query, onSuccess(populateData));
        }
      }
    }

    function populateData(response) {
      log.info("Populate data " + response);

      var data = response.value;
      if (data) {
        // the model is json object from the string data
        $scope.model = JSON.parse(data);
        // set title and description
        $scope.model.title = $scope.endpointUrl;
        $scope.model.description = $scope.model.component.description;
        // TODO: look for specific endpoint icon,
        $scope.icon = Core.url("/img/icons/camel/endpoint24.png");

        // TODO: grab from model each property that has a value and use as the node data
        $scope.nodeData = {};

        var labels = [];
        if ($scope.model.component.label) {
          labels = $scope.model.component.label.split(",");
        }
        $scope.labels = labels;
        $scope.viewTemplate = "app/camel/html/nodePropertiesView.html";

        Core.$apply($scope);
      }
    }

  }]);
}



