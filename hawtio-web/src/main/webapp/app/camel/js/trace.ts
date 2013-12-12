module Camel {
  export function TraceRouteController($scope, workspace:Workspace, jolokia, localStorage) {
    $scope.camelMaximumTraceOrDebugBodyLength = Camel.maximumTraceOrDebugBodyLength(localStorage);
    $scope.tracing = false;
    $scope.messages = [];
    $scope.graphView = null;
    $scope.tableView = null;
    $scope.mode = 'text';

    $scope.messageDialog = new Core.Dialog();

    $scope.gridOptions = Camel.createBrowseGridOptions();
    $scope.gridOptions.selectWithCheckboxOnly = false;
    $scope.gridOptions.showSelectionCheckbox = false;
    $scope.gridOptions.multiSelect = false;
    $scope.gridOptions.afterSelectionChange = onSelectionChanged;
    $scope.gridOptions.columnDefs.push({
      field: 'toNode',
      displayName: 'To Node'
    });


    $scope.startTracing = () => {
      setTracing(true);
    };

    $scope.stopTracing = () => {
      setTracing(false);
    };

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      $scope.messages = [];
      reloadTracingFlag();
    });

        // TODO can we share these 2 methods from activemq browse / camel browse / came trace?
    $scope.openMessageDialog = (message) => {
      var idx = Core.pathGet(message, ["rowIndex"]);
      $scope.selectRowIndex(idx);
      if ($scope.row) {
        $scope.mode = CodeEditor.detectTextFormat($scope.row.body);
        $scope.messageDialog.open();
      }
    };

    $scope.selectRowIndex = (idx) => {
      $scope.rowIndex = idx;
      var selected = $scope.gridOptions.selectedItems;
      selected.splice(0, selected.length);
      if (idx >= 0 && idx < $scope.messages.length) {
        $scope.row = $scope.messages[idx];
        if ($scope.row) {
          selected.push($scope.row);
        }
      } else {
        $scope.row = null;
      }
      onSelectionChanged();
    };


    function reloadTracingFlag() {
      $scope.tracing = false;
      // clear any previous polls
      closeHandle($scope, jolokia);

      var mbean = getSelectionCamelTraceMBean(workspace);
      if (mbean) {
        $scope.tracing = jolokia.getAttribute(mbean, "Enabled", onSuccess(null));

        if ($scope.tracing) {
          var traceMBean = mbean;
          if (traceMBean) {
            var query = {type: 'exec', mbean: traceMBean, operation: 'dumpAllTracedMessagesAsXml'};
            scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(populateRouteMessages, query));
          }
          $scope.graphView = "app/camel/html/routes.html";
          $scope.tableView = "app/camel/html/browseMessages.html";
        } else {
          $scope.messages = [];
          $scope.graphView = null;
          $scope.tableView = null;
        }
        console.log("Tracing is now " + $scope.tracing);
      }
    }

    function populateRouteMessages(response) {
      // filter messages due CAMEL-7045 but in camel-core
      // see https://github.com/hawtio/hawtio/issues/292
      var selectedRouteId = getSelectedRouteId(workspace);

      var first = $scope.messages.length === 0;
      var xml = response.value;
      if (angular.isString(xml)) {
        // lets parse the XML DOM here...
        var doc = $.parseXML(xml);
        var allMessages = $(doc).find("fabricTracerEventMessage");
        if (!allMessages || !allMessages.length) {
          // lets try find another element name
          allMessages = $(doc).find("backlogTracerEventMessage");
        }

        allMessages.each((idx, message) => {
          var routeId = $(message).find("routeId").text();
          if (routeId === selectedRouteId) {
            var messageData = Camel.createMessageFromXml(message);
            var toNode = $(message).find("toNode").text();
            if (toNode) {
              messageData["toNode"] = toNode;
            }
            $scope.messages.push(messageData);
            Core.$apply($scope);
          }
        });
      }
    }

    function onSelectionChanged() {
      //console.log("===== selection changed!!! and its now " + $scope.gridOptions.selectedItems.length);
      angular.forEach($scope.gridOptions.selectedItems, (selected) => {
        if (selected) {
          var toNode = selected["toNode"];
          if (toNode) {
            // lets highlight the node in the diagram
            var nodes = d3.select("svg").selectAll("g .node");

            // lets clear the selected node first
            nodes.attr("class", "node");

            nodes.filter(function (item) {
              if (item) {
                var cid = item["cid"];
                var rid = item["rid"];
                var type = item["type"];

                // if its from then match on rid
                if ("from" === type) {
                  return toNode === rid;
                }

                if (cid) {
                  // we should match cid if defined
                  return toNode === cid;
                } else {
                  return toNode === rid;
                }
              }
              return null;
            }).attr("class", "node selected");
          }
        }
      });
    }

    function tracingChanged(response) {
      reloadTracingFlag();
      Core.$apply($scope);
    }

    function setTracing(flag:Boolean) {
      var mbean = getSelectionCamelTraceMBean(workspace);
      if (mbean) {
        // set max only supported on BacklogTracer
        // (the old fabric tracer does not support max length)
        if (mbean.toString().endsWith("BacklogTracer")) {
          var max = $scope.camelMaximumTraceOrDebugBodyLength;
          jolokia.setAttribute(mbean, "BodyMaxChars",  max);
        }
        jolokia.setAttribute(mbean, "Enabled", flag, onSuccess(tracingChanged));
      }
    }

  }

}
