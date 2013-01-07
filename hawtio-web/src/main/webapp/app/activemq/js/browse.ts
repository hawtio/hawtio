module ActiveMQ {
    export function BrowseQueueController($scope, workspace:Workspace) {
      var ignoreColumns = ["PropertiesText", "BodyPreview", "Text"];
      var flattenColumns = ["BooleanProperties", "ByteProperties", "ShortProperties", "IntProperties", "LongProperties", "FloatProperties",
        "DoubleProperties", "StringProperties"];

      $scope.widget = new TableWidget($scope, workspace, [
        {
          "mDataProp": null,
          "sClass": "control center",
          "sDefaultContent": '<i class="icon-plus"></i>'
        },
        { "mDataProp": "JMSMessageID" },
        /*
         {
         "sDefaultContent": "",
         "mData": null,
         "mDataProp": "Text"
         },
         */
        { "mDataProp": "JMSCorrelationID" },
        { "mDataProp": "JMSTimestamp" },
        { "mDataProp": "JMSDeliveryMode" },
        { "mDataProp": "JMSReplyTo" },
        { "mDataProp": "JMSRedelivered" },
        { "mDataProp": "JMSPriority" },
        { "mDataProp": "JMSXGroupSeq" },
        { "mDataProp": "JMSExpiration" },
        { "mDataProp": "JMSType" },
        { "mDataProp": "JMSDestination" }
      ], {
        rowDetailTemplateId: 'bodyTemplate',
        ignoreColumns: ignoreColumns,
        flattenColumns: flattenColumns
      });

      var populateTable = function (response) {
        $scope.widget.populateTable(response.value);
      };

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
    }
}