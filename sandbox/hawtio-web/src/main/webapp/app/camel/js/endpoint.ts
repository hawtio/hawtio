/// <reference path="camelPlugin.ts"/>
module Camel {
  _module.controller("Camel.EndpointController", ["$scope", "$location", "localStorage", "workspace", "jolokia", ($scope, $location, localStorage:WindowLocalStorage, workspace:Workspace, jolokia) => {
    Camel.initEndpointChooserScope($scope, $location, localStorage, workspace, jolokia);
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.workspace = workspace;
    $scope.message = "";

    $scope.createEndpoint = (name) => {
      var jolokia = workspace.jolokia;
      if (jolokia) {
        var mbean = getSelectionCamelContextMBean(workspace, camelJmxDomain);
        if (mbean) {
          $scope.message = name;
          var operation = "createEndpoint(java.lang.String)";
          jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
        } else {
          Core.notification("error", "Could not find the CamelContext MBean!");
        }
      }
    };

    $scope.createEndpointFromData = () => {
      if ($scope.selectedComponentName && $scope.endpointPath) {
        var name = $scope.selectedComponentName + "://" + $scope.endpointPath;
        console.log("Have endpoint data " + JSON.stringify($scope.endpointParameters));

        var params = "";
        angular.forEach($scope.endpointParameters, (value, key) => {
          var prefix = params ? "&" : "";
          params += prefix + key + "=" + value;
        });
        if (params) {
          name += "?" + params;
        }
        // TODO use form data too for URIs parameters...
        $scope.createEndpoint(name);
      }
    };

    $scope.deleteEndpoint = () => {
      var jolokia = workspace.jolokia;
      var selection = workspace.selection;
      var entries = selection.entries;
      if (selection && jolokia && entries) {
        var domain = selection.domain;
        var brokerName = entries["BrokerName"];
        var name = entries["Destination"];
        var isQueue = "Topic" !== entries["Type"];
        if (domain && brokerName) {
          var mbean = "" + domain + ":BrokerName=" + brokerName + ",Type=Broker";
          $scope.message = "Deleting " + (isQueue ? "queue" : "topic") + " " + name;
          var operation = "removeEndpoint(java.lang.String)";
          jolokia.execute(mbean, operation, name, onSuccess(deleteSuccess));
        }
      }
    };

    function operationSuccess(endpointCreated) {
      $scope.endpointName = "";
      $scope.workspace.operationCounter += 1;
      Core.$apply($scope);

      if (endpointCreated && endpointCreated === true) {
        Core.notification('success', "Creating endpoint " + $scope.message);
      } else {
        Core.notification('error', "Failed to create endpoint " + $scope.message);
      }
    }

    function deleteSuccess() {
      // lets set the selection to the parent
      if (workspace.selection) {
        var parent = Core.pathGet(workspace, ["selection", "parent"]);
        if (parent) {
          $scope.workspace.updateSelectionNode(parent);
        }
      }
      $scope.workspace.operationCounter += 1;
      Core.$apply($scope);
      Core.notification("success", $scope.message);
    }
  }]);
}
