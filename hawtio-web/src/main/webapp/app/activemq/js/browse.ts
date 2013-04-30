module ActiveMQ {
  export function BrowseQueueController($scope, workspace:Workspace, jolokia) {

    $scope.searchText = '';

    $scope.messages = [];
    $scope.headers = {};

    $scope.deleteDialog = false;
    $scope.moveDialog = false;

    $scope.gridOptions = {
      selectedItems: [],
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
      showSelectionCheckbox: true,
      maintainColumnRatios: false,
      columnDefs: [
        {
          field: 'JMSMessageID',
          displayName: 'Message ID',
          cellTemplate: '<div class="ngCellText"><a ng-click="openMessageDialog(row)">{{row.entity.JMSMessageID}}</a></div>',
          // for ng-grid
          width: '34%'
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
          width: '7%'
        },
        {
          field: 'JMSTimestamp',
          displayName: 'Timestamp',
          width: '19%'
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
          width: '10%'
        }
      ]
    };

    $scope.messageDialog = new Core.TableDetailDialog($scope, $scope.gridOptions);

    var ignoreColumns = ["PropertiesText", "BodyPreview", "Text"];
    var flattenColumns = ["BooleanProperties", "ByteProperties", "ShortProperties", "IntProperties", "LongProperties", "FloatProperties",
      "DoubleProperties", "StringProperties"];

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      // lets defer execution as we may not have the selection just yet
      setTimeout(loadTable, 50);
    });

    $scope.openMessageDialog = (message) => {
      $scope.rowIndex = Core.pathGet(message, ["rowIndex"]);
      $scope.row = Core.pathGet(message, ["entity"]);
      if ($scope.row) {
        $scope.messageDialog.open();
      }
    };

    $scope.moveMessages = () => {
        var selection = workspace.selection;
        var mbean = selection.objectName;
        if (mbean && selection) {
          var selectedItems = $scope.gridOptions.selectedItems;
          $scope.message = "Moved " + Core.maybePlural(selectedItems.length, "message" + " to " + $scope.queueName);
            var operation = "moveMessageTo(java.lang.String, java.lang.String)";
            angular.forEach(selectedItems, (item, idx) => {
                var id = item.JMSMessageID;
                if (id) {
                    var callback = (idx + 1 < selectedItems.length) ? intermediateResult : deleteSuccess;
                    jolokia.execute(mbean, operation, id, $scope.queueName, onSuccess(callback));
                }
            });
        }
    };

    $scope.deleteMessages = () => {
      var selection = workspace.selection;
      var mbean = selection.objectName;
      if (mbean && selection) {
        var selectedItems = $scope.gridOptions.selectedItems;
        $scope.message = "Deleted " + Core.maybePlural(selectedItems.length, "message");
        var operation = "removeMessage(java.lang.String)";
        angular.forEach(selectedItems, (item, idx) => {
          var id = item.JMSMessageID;
          if (id) {
            var callback = (idx + 1 < selectedItems.length) ? intermediateResult : deleteSuccess;
            jolokia.execute(mbean, operation, id, onSuccess(callback));
          }
        });
      }
    };

    $scope.queueNames = () => {
      var queuesFolder = getSelectionQueuesFolder(workspace);
      return (queuesFolder) ? queuesFolder.children.map(n => n.title) : [];
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
