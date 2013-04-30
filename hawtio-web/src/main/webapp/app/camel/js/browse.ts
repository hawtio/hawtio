module Camel {

  export function BrowseEndpointController($scope, workspace:Workspace, jolokia) {
    $scope.workspace = workspace;

    $scope.messageDialog = new Core.Dialog();
    $scope.forwardDialog = new Core.Dialog();

    $scope.gridOptions = Camel.createBrowseGridOptions();

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      loadData();
    });

    $scope.openMessageDialog = (message) => {
      $scope.row = Core.pathGet(message, ["entity"]);
      if ($scope.row) {
        $scope.messageDialog.open();
      }
    };

    $scope.forwardMessagesAndCloseForwardDialog = () => {
      var mbean = getSelectionCamelContextMBean(workspace);
      var selectedItems = $scope.gridOptions.selectedItems;
      var uri = $scope.endpointUri;
      if (mbean && selectedItems && uri) {
        $scope.message = "Forwarded " + Core.maybePlural(selectedItems.length, "message" + " to " + uri);
        angular.forEach(selectedItems, (item, idx) => {
          var callback = (idx + 1 < selectedItems.length) ? intermediateResult : operationSuccess;
          var body = item.body;
          var headers = item.headers;
          console.log("sending to uri " + uri + " headers: " + JSON.stringify(headers) + " body: " + body);
          jolokia.execute(mbean, "sendBodyAndHeaders(java.lang.String, java.lang.Object, java.util.Map)", uri, body, headers, onSuccess(callback));
        });
      }
      $scope.forwardDialog.close();
    };

    $scope.endpointUris = () => {
      var endpointFolder = Camel.getSelectionCamelContextEndpoints(workspace);
      return (endpointFolder) ? endpointFolder.children.map(n => n.title) : [];
    };

    function intermediateResult() {
    }

    function operationSuccess() {
      notification("success", $scope.message);
      setTimeout(loadData, 50);
    }

    function loadData() {
      var mbean = workspace.getSelectedMBeanName();
      if (mbean) {
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
  }
}