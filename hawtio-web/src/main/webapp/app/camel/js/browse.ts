
module Camel {

  export function BrowseEndpointController($scope, workspace:Workspace, jolokia) {
    $scope.workspace = workspace;

    $scope.messageDialog = new Core.Dialog();

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