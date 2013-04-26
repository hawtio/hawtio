
module Camel {

  export function BrowseEndpointController($scope, workspace:Workspace, jolokia) {
    $scope.workspace = workspace;

    $scope.messageDialog = new Core.Dialog();

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      data: 'messages',
      displayFooter: false,
      showFilter: false,
      showColumnMenu: true,
      enableColumnResize: true,
      enableColumnReordering: true,
      filterOptions: {
        filterText: ''
      },
      selectWithCheckboxOnly: true,
      maintainColumnRatios: false,
      columnDefs: [
        {
          field: 'id',
          displayName: 'ID',
          // for ng-grid
          //width: '50%',
          // for hawtio-datatable
          // width: "22em",
          cellTemplate: '<div class="ngCellText"><a ng-click="openMessageDialog(row)">{{row.entity.id}}</a></div>'
        }
      ]
    };

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