function BrowseQueueController($scope, workspace:Workspace) {
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
    ignoreColumns: ["PropertiesText", "BodyPreview", "Text"],
    flattenColumns: ["BooleanProperties", "ByteProperties", "ShortProperties", "IntProperties", "LongProperties", "FloatProperties", "DoubleProperties", "StringProperties"]
  });

  var populateTable = function (response) {
    $scope.widget.populateTable(response.value);
  };

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;

    // TODO could we refactor the get mbean thingy??
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
  });
}
