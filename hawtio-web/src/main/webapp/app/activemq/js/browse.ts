module ActiveMQ {
  export function BrowseQueueController($scope, workspace:Workspace) {

    $scope.selectedItems = [];
    $scope.headers = {};

    $scope.showMessageDialog = false;
    $scope.messageDialogOptions = {
      backdropFade: true,
      dialogFade: true
    };

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      data: 'messages',
      displayFooter: false,
      showFilter: false,
      filterOptions: {
        filterText: "searchText"
      },
      selectWithCheckboxOnly: true,
      columnDefs: [
        {
          field: 'JMSMessageID',
          displayName: 'Message ID',
          cellTemplate: '<div class="ngCellText"><a ng-click="openMessageDialog(row)">{{row.entity.JMSMessageID}}</a></div>',
          // for ng-grid
          width: "***"
          // for hawtio-datatable
          // width: "22em"
        },
        {
          field: 'JMSType',
          displayName: 'Type'
        },
        {
          field: 'JMSPriority',
          displayName: 'Priority'
        },
        {
          field: 'JMSTimestamp',
          displayName: 'Timestamp'
        },
        {
          field: 'JMSExpiration',
          displayName: 'Expires'
        },
        {
          field: 'JMSReplyTo',
          displayName: 'Reply To'
        },
        {
          field: 'JMSCorrelationID',
          displayName: 'Correlation ID'
        }
      ],
      rowDetailTemplateId: "activemqMessageTemplate"
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
        $scope.showMessageDialog = true;
      }
    };

    $scope.closeMessageDialog = () => {
      $scope.showMessageDialog = false;
    };

    $scope.move = () => {
      console.log("moving selected items " + $scope.selectedItems.length + " to another destination!");
    };

    $scope.openDeleteDialog = () => {
      $scope.showDeleteDialog = true;
    };

    $scope.deleteMessagesAndCloseDeleteDialog = () => {
      var jolokia = workspace.jolokia;
      var selection = workspace.selection;
      var mbean = selection.objectName;
      if (mbean && selection && jolokia) {
        $scope.message = "Deleted message";
        var operation = "removeMessage(java.lang.String)";
        angular.forEach($scope.selectedItems, (item, idx) => {
          var id = item.JMSMessageID;
          if (id) {
            var callback = (idx + 1 < $scope.selectedItems.length) ? intermediateResult : deleteSuccess;
            jolokia.execute(mbean, operation, id, onSuccess(callback));
          }
        });
      }
      $scope.closeDeleteDialog();
    };

    $scope.closeDeleteDialog = () => {
      $scope.showDeleteDialog = false;
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