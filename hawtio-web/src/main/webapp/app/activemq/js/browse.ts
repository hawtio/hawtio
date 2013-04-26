module ActiveMQ {
  export function BrowseQueueController($scope, workspace:Workspace) {

    $scope.searchText = '';

    $scope.selectedItems = [];
    $scope.messages = [];
    $scope.headers = {};

    $scope.deleteDialog = new Core.Dialog();
    $scope.messageDialog = new Core.Dialog();
    $scope.moveDialog = new Core.Dialog();

    $scope.showMoveDialog = false;

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
          field: 'JMSMessageID',
          displayName: 'Message ID',
          cellTemplate: '<div class="ngCellText"><a ng-click="openMessageDialog(row)">{{row.entity.JMSMessageID}}</a></div>',
          // for ng-grid
          width: '50%'
          // for hawtio-datatable
          // width: "22em"
        },
        {
          field: 'JMSType',
          displayName: 'Type',
          width: '10%'
        },
        {
          field: 'JMSPriority',
          displayName: 'Priority',
          width: '10%'
        },
        {
          field: 'JMSTimestamp',
          displayName: 'Timestamp',
          width: '40%'
        },
        {
          field: 'JMSExpiration',
          displayName: 'Expires',
          width: '10%'
        },
        {
          field: 'JMSReplyTo',
          displayName: 'Reply To',
          width: '10%'
        },
        {
          field: 'JMSCorrelationID',
          displayName: 'Correlation ID',
          width: '40%'
        }
      ]//,
      /*
      rowDetailTemplateId: "activemqMessageTemplate"*/
    };


    var ignoreColumns = ["PropertiesText", "BodyPreview", "Text"];
    var flattenColumns = ["BooleanProperties", "ByteProperties", "ShortProperties", "IntProperties", "LongProperties", "FloatProperties",
      "DoubleProperties", "StringProperties"];

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      // lets defer execution as we may not have the selection just yet
      setTimeout(loadTable, 50);
    });

    $scope.openMessageDialog = (message) => {
      $scope.row = Core.pathGet(message, ["entity"]);
      if ($scope.row) {
        $scope.messageDialog.open();
      }
    };

    $scope.moveMessagesAndCloseMoveDialog = () => {
        var jolokia = workspace.jolokia;
        var selection = workspace.selection;
        var mbean = selection.objectName;
        if (mbean && selection && jolokia) {
            $scope.message = "Moved " + Core.maybePlural($scope.selectedItems.length, "message" + " to " + $scope.queueName);
            var operation = "moveMessageTo(java.lang.String, java.lang.String)"
            angular.forEach($scope.selectedItems, (item, idx) => {
                var id = item.JMSMessageID;
                if (id) {
                    var callback = (idx + 1 < $scope.selectedItems.length) ? intermediateResult : deleteSuccess;
                    jolokia.execute(mbean, operation, id, $scope.queueName, onSuccess(callback));
                }
            });
        }
        $scope.moveDialog.close();
    };

    $scope.deleteMessagesAndCloseDeleteDialog = () => {
      var jolokia = workspace.jolokia;
      var selection = workspace.selection;
      var mbean = selection.objectName;
      if (mbean && selection && jolokia) {
        $scope.message = "Deleted " + Core.maybePlural($scope.selectedItems.length, "message");
        var operation = "removeMessage(java.lang.String)";
        angular.forEach($scope.selectedItems, (item, idx) => {
          var id = item.JMSMessageID;
          if (id) {
            var callback = (idx + 1 < $scope.selectedItems.length) ? intermediateResult : deleteSuccess;
            jolokia.execute(mbean, operation, id, onSuccess(callback));
          }
        });
      }
      $scope.deleteDialog.close();
    };

    function populateTable(response) {
      $scope.messages = response.value;
      angular.forEach($scope.messages, (message) => {
        message.headerHtml = createHeaderHtml(message);
      });
      Core.$apply($scope);
    }

    /**
     * For some reason using ng-repeat in the modal dialog doesn't work so lets
     * just create the HTML in code :)
     */
    function createHeaderHtml(message) {
      var headers = createHeaders(message);
      var buffer = "";
      angular.forEach(headers, (value, key) => {
        buffer += "<tr><td class='property-name'>" + key + "</td>" +
                "<td class='property-value'>" + value + "</td></tr>";
      });
      return buffer;
    }

    function createHeaders(row) {
      var answer = {};
      angular.forEach(row, (value, key) => {
        if (!ignoreColumns.any(key)) {
          if (flattenColumns.any(key)) {
            angular.forEach(value, (v2, k2) => answer[k2] = v2);
          } else {
            answer[key] = value;
          }
        }
      });
      return answer;
    }

    function loadTable() {
      var selection = workspace.selection;
      if (selection) {
        var mbean = selection.objectName;
        if (mbean) {
          var jolokia = workspace.jolokia;

          jolokia.request(
                  {type: 'exec', mbean: mbean, operation: 'browse()'},
                  onSuccess(populateTable));
        }
      }
    }

    function intermediateResult() {
    }

    function deleteSuccess() {
      notification("success", $scope.message);
      setTimeout(loadTable, 50);
    }
  }
}
