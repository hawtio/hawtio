function TraceRouteController($scope, workspace:Workspace) {
  $scope.tracing = false;
  $scope.data = [];
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

  var jolokia = workspace.jolokia;

  function tracingChanged(response) {
    reloadTracingFlag();
    $scope.$apply();
  }

  function setTracing(flag:Boolean) {
    var mbean = workspace.getSelectedMBeanName();
    if (mbean) {
      var options = onSuccess(tracingChanged);
      jolokia.execute(mbean, 'setTracing', flag, options);
    }
  }

  $scope.startTracing = () => {
    setTracing(true);
  };

  $scope.stopTracing = () => {
    setTracing(false);
  };

  function reloadTracingFlag() {
    $scope.tracing = false;
    // clear any previous polls
    closeHandle($scope, jolokia);

    var mbean = workspace.getSelectedMBeanName();
    if (mbean) {
      $scope.tracing = jolokia.execute(mbean, 'getTracing()');

      if ($scope.tracing) {
        var traceMBean = getSelectionCamelTraceMBean(workspace);
        if (traceMBean) {
          var query = {type: 'exec', mbean: traceMBean, operation: 'dumpAllTracedMessagesAsXml'};
          scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(populateRouteMessages, query));
        }
      } else {
        $scope.data = [];
      }
    }
  }

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;
    $scope.data = [];
    reloadTracingFlag();
  });


  var populateRouteMessages = function (response) {
    var first = $scope.data.length === 0;
    var xml = response.value;
    if (angular.isString(xml)) {
      // lets parse the XML DOM here...
      var doc = $.parseXML(xml);
      var allMessages = $(doc).find("fabricTracerEventMessage");

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
        var body = $(message).find("body")[0];
        if (body) {
          var bodyText = body.textContent;
          var bodyType = body.getAttribute("type");
          messageData["body"] = bodyText;
          messageData["bodyType"] = bodyType;
        }
        var toNode = $(message).find("toNode").text();
        if (toNode) {
          messageData["toNode"] = toNode;
        }
        $scope.data.push(messageData);
        if (first) {
          console.log("Loading first item");
          $scope.widget.populateTable($scope.data);
          first = false;
        } else {
          console.log("Loading another row!");
          $scope.widget.addData(messageData);
        }
      });
    }
  };
}