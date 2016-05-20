/// <reference path="camelPlugin.ts"/>
module Camel {
  _module.controller("Camel.TraceRouteController", ["$scope", "workspace", "jolokia", "localStorage", "tracerStatus", ($scope, workspace:Workspace, jolokia, localStorage, tracerStatus) => {
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    var log:Logging.Logger = Logger.get("CamelTracer");

    $scope.workspace = workspace;

    $scope.tracing = false;
    $scope.messages = [];
    $scope.graphView = null;
    $scope.tableView = null;
    $scope.mode = 'text';

    $scope.messageDialog = new UI.Dialog();

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
      log.info("Start tracing");
      setTracing(true);
    };

    $scope.stopTracing = () => {
      log.info("Stop tracing");
      setTracing(false);
    };

    $scope.clear = () => {
      log.debug("Clear messages")
      tracerStatus.messages = [];
      $scope.messages = [];
      if ($scope.row) {
        $scope.messageDialog.close();
      }
      Core.$apply($scope);
    };

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) {
        return;
      }
      $scope.messages = tracerStatus.messages;
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
      if (tracerStatus.jhandle != null) {
        log.debug("Unregistering jolokia handle")
        jolokia.unregister(tracerStatus.jhandle)
        tracerStatus.jhandle = null;
      }

      var mbean = getSelectionCamelTraceMBean(workspace, camelJmxDomain);
      if (mbean) {
        $scope.tracing = jolokia.getAttribute(mbean, "Enabled", onSuccess(null));

        if ($scope.tracing) {
          var traceMBean = mbean;
          if (traceMBean) {
            // register callback for doing live update of tracing
            if (tracerStatus.jhandle === null) {
              log.debug("Registering jolokia handle")
              tracerStatus.jhandle = jolokia.register(populateRouteMessages, {
                type: 'exec', mbean: traceMBean,
                operation: 'dumpAllTracedMessagesAsXml()',
                ignoreErrors: true,
                arguments: []
              });
            }
          }
          $scope.graphView = "app/camel/html/routes.html";
          $scope.tableView = "app/camel/html/browseMessages.html";
        } else {
          tracerStatus.messages = [];
          $scope.messages = [];
          $scope.graphView = null;
          $scope.tableView = null;
        }
      }
    }

    function populateRouteMessages(response) {
      log.debug("Populating response " + response);

      // filter messages due CAMEL-7045 but in camel-core
      // see https://github.com/hawtio/hawtio/issues/292
      var selectedRouteId = getSelectedRouteId(workspace);

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
            log.debug("Adding new message to trace table with id " + messageData["id"]);
            $scope.messages.push(messageData);
          }
        });
        // keep state of the traced messages on tracerStatus
        tracerStatus.messages = $scope.messages;
        Core.$apply($scope);
      }
    }

    function onSelectionChanged() {
      angular.forEach($scope.gridOptions.selectedItems, (selected) => {
        if (selected) {
          var toNode = selected["toNode"];
          if (toNode) {
            // lets highlight the node in the diagram
            var nodes = d3.select("svg").selectAll("g .node");
            Camel.highlightSelectedNode(nodes, toNode);
          }
        }
      });
    }

    function tracingChanged(response) {
      reloadTracingFlag();
      Core.$apply($scope);
    }

    function setTracing(flag:Boolean) {
      var mbean = getSelectionCamelTraceMBean(workspace, camelJmxDomain);
      if (mbean) {
        // set max only supported on BacklogTracer
        // (the old fabric tracer does not support max length)
        if (mbean.toString().endsWith("BacklogTracer")) {
          var max = Camel.maximumTraceOrDebugBodyLength(localStorage);
          var streams = Camel.traceOrDebugIncludeStreams(localStorage);
          jolokia.setAttribute(mbean, "BodyMaxChars",  max);
          jolokia.setAttribute(mbean, "BodyIncludeStreams", streams);
          jolokia.setAttribute(mbean, "BodyIncludeFiles", streams);
        }
        jolokia.setAttribute(mbean, "Enabled", flag, onSuccess(tracingChanged));
      }
    }

    log.info("Re-activating tracer with " + tracerStatus.messages.length + " existing messages");
    $scope.messages = tracerStatus.messages;
    $scope.tracing = tracerStatus.jhandle != null;
  }]);

}
