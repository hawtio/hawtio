function BrowseEndpointController($scope, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.widget = new TableWidget($scope, workspace, [
    {
      "mDataProp": null,
      "sClass": "control center",
      "sDefaultContent": '<i class="icon-plus"></i>'
    }
  ], {
    rowDetailTemplateId: 'bodyTemplate',
    ignoreColumns: ["headerTypes", "body"],
    flattenColumns: ["headers"]
  });

  var populateTable = function (response) {
    var data = [];
    if (angular.isString(response)) {
      // lets parse the XML DOM here...
      var doc = $.parseXML(response);
      var allMessages = $(doc).find("message");

      allMessages.each((idx, message) => {
        var messageData = {
          headers: {},
          headerTypes: {}
        };
        var headers = $(message).find("header");
        headers.each((idx, header) => {
          var key = header.getAttribute("key");
          var typeName = header.getAttribute("type");
          var value = header.textContent;
          if (key) {
            if (value) messageData.headers[key] = value;
            if (typeName) messageData.headerTypes[key] = typeName;
          }
        });
        var body = $(message).children("body")[0];
        if (body) {
          var bodyText = body.textContent;
          var bodyType = body.getAttribute("type");
          messageData["body"] = bodyText;
          messageData["bodyType"] = bodyType;
        }
        data.push(messageData);
      });
    }
    $scope.widget.populateTable(data);
  };

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;

    var mbean = getSelectionBundleMBean(workspace);
    if (mbean) {
      var jolokia = workspace.jolokia;
      var options = onSuccess(populateTable);
      jolokia.execute(mbean, 'browseAllMessagesAsXml(java.lang.Boolean)', true, options);
    }
  });
}
