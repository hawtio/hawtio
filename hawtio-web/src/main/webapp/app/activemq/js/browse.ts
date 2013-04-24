module ActiveMQ {
  export function BrowseQueueController($scope, workspace:Workspace) {

    $scope.selectedItems = [];

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      data: 'messages',
      displayFooter: false,
      showFilter: false,
      filterOptions: {
        filterText: "searchText"
      },
      columnDefs: [
        {
          field: 'JMSMessageID',
          displayName: 'Message ID',
          width: "22em"
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

    // TODO This should be a directive
    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      // lets defer execution as we may not have the selection just yet
      setTimeout(loadTable, 50);
    });

    $scope.headers = (row) => {
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
    };

    function populateTable(response) {
      $scope.messages = response.value;
      //$scope.widget.populateTable(response.value);
      Core.$apply($scope);
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
  }
}