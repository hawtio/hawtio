/// <reference path="camelPlugin.ts"/>
module Camel {

  export var BrowseEndpointController = _module.controller("Camel.BrowseEndpointController", ["$scope", "$routeParams", "workspace", "jolokia", "localStorage", ($scope, $routeParams, workspace:Workspace, jolokia, localStorage) => {

    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.workspace = workspace;

    $scope.forwardDialog = new UI.Dialog();

    $scope.showMessageDetails = false;
    $scope.mode = 'text';

    $scope.gridOptions = Camel.createBrowseGridOptions();

    $scope.contextId = $routeParams["contextId"];
    $scope.endpointPath = $routeParams["endpointPath"];

    $scope.isJmxTab = !$routeParams["contextId"] || !$routeParams["endpointPath"];

    $scope.$watch('workspace.selection', function () {
      if ($scope.isJmxTab && workspace.moveIfViewInvalid()) return;
      loadData(camelJmxDomain);
    });

    // TODO can we share these 2 methods from activemq browse / camel browse / came trace?
    $scope.openMessageDialog = (message) => {
      ActiveMQ.selectCurrentMessage(message, "id", $scope);
      if ($scope.row) {
        $scope.mode = CodeEditor.detectTextFormat($scope.row.body);
        $scope.showMessageDetails = true;
      }
    };

    ActiveMQ.decorate($scope);

    $scope.forwardMessagesAndCloseForwardDialog = () => {
      var mbean = getSelectionCamelContextMBean(workspace, camelJmxDomain);
      var selectedItems = $scope.gridOptions.selectedItems;
      var uri = $scope.endpointUri;
      if (mbean && uri && selectedItems && selectedItems.length) {
        //console.log("Creating a new endpoint called: " + uri + " just in case!");
        jolokia.execute(mbean, "createEndpoint(java.lang.String)", uri, onSuccess(intermediateResult));

        $scope.message = "Forwarded " + Core.maybePlural(selectedItems.length, "message" + " to " + uri);
        angular.forEach(selectedItems, (item, idx) => {
          var callback = (idx + 1 < selectedItems.length) ? intermediateResult : operationSuccess;
          var body = item.body;
          var headers = item.headers;
          //console.log("sending to uri " + uri + " headers: " + JSON.stringify(headers) + " body: " + body);
          jolokia.execute(mbean, "sendBodyAndHeaders(java.lang.String, java.lang.Object, java.util.Map)", uri, body, headers, onSuccess(callback));
        });
      }
      $scope.forwardDialog.close();
    };

    $scope.endpointUris = () => {
      var endpointFolder = Camel.getSelectionCamelContextEndpoints(workspace, camelJmxDomain);
      return (endpointFolder) ? endpointFolder.children.map(n => n.title) : [];
    };

    $scope.refresh = loadData;

    function intermediateResult() {
    }

    function operationSuccess() {
      if ($scope.messageDialog) {
        $scope.messageDialog.close();
      }
      $scope.gridOptions.selectedItems.splice(0);
      Core.notification("success", $scope.message);
      setTimeout(loadData, 50);
    }

    function loadData(camelJmxDomain) {
      var mbean: string = null;
      if ($scope.contextId && $scope.endpointPath) {
        var node = workspace.findMBeanWithProperties(camelJmxDomain, {
          context: $scope.contextId,
          type: "endpoints",
          name: $scope.endpointPath
        });
        if (node) {
          mbean = node.objectName;
        }
      }
      if (!mbean) {
        mbean = workspace.getSelectedMBeanName();
      }
      if (mbean) {
        log.info("MBean: " + mbean);
        var options = onSuccess(populateTable);
        jolokia.execute(mbean, 'browseAllMessagesAsXml(java.lang.Boolean)', true, options);
      }
    }

    function populateTable(response) {
      var data = [];
      if (angular.isString(response)) {
        // lets parse the XML DOM here...
        var doc = $.parseXML(response);
        var allMessages = $(doc).find("message");

        allMessages.each((idx, message) => {
          var messageData = Camel.createMessageFromXml(message);
          data.push(messageData);
        });
      }
      $scope.messages = data;
      Core.$apply($scope);
    }
  }]);
}
