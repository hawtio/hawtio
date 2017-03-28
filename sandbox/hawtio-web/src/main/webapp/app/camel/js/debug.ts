/// <reference path="camelPlugin.ts"/>
module Camel {
  _module.controller("Camel.DebugRouteController", ["$scope", "$element", "workspace", "jolokia", "localStorage", ($scope, $element, workspace:Workspace, jolokia, localStorage) => {

    $scope.workspace = workspace;
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    // ignore the cached stuff in camel.ts as it seems to bork the node ids for some reason...
    $scope.ignoreRouteXmlNode = true;

    $scope.startDebugging = () => {
      setDebugging(true);
    };

    $scope.stopDebugging = () => {
      setDebugging(false);
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(reloadData, 50);
    });

    $scope.$on("camel.diagram.selectedNodeId", (event, value) => {
      $scope.selectedDiagramNodeId = value;
      updateBreakpointFlag();
    });

    $scope.$on("camel.diagram.layoutComplete", (event, value) => {
      updateBreakpointIcons();

      $($element).find("g.node").dblclick(function (n) {
        var id = this.getAttribute("data-cid");
        $scope.toggleBreakpoint(id);
      });
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      reloadData();
    });

    $scope.toggleBreakpoint = (id) => {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      if (mbean && id) {
        var method = isBreakpointSet(id) ? "removeBreakpoint" : "addBreakpoint";
        jolokia.execute(mbean, method, id, onSuccess(breakpointsChanged));
      }
    };

    $scope.addBreakpoint = () => {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      if (mbean && $scope.selectedDiagramNodeId) {
        jolokia.execute(mbean, "addBreakpoint", $scope.selectedDiagramNodeId, onSuccess(breakpointsChanged));
      }
    };

    $scope.removeBreakpoint = () => {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      if (mbean && $scope.selectedDiagramNodeId) {
        jolokia.execute(mbean, "removeBreakpoint", $scope.selectedDiagramNodeId, onSuccess(breakpointsChanged));
      }
    };

    $scope.resume = () => {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      if (mbean) {
        jolokia.execute(mbean, "resumeAll", onSuccess(clearStoppedAndResume));
      }
    };

    $scope.suspend = () => {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      if (mbean) {
        jolokia.execute(mbean, "suspendAll", onSuccess(clearStoppedAndResume));
      }
    };

    $scope.step = () => {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      var stepNode = getStoppedBreakpointId();
      if (mbean && stepNode) {
        jolokia.execute(mbean, "stepBreakpoint(java.lang.String)", stepNode, onSuccess(clearStoppedAndResume));
      }
    };


    // TODO refactor into common code with trace.ts?
    // START
    $scope.messages = [];
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

    $scope.openMessageDialog = (message) => {
      var idx = Core.pathGet(message, ["rowIndex"]);
      $scope.selectRowIndex(idx);
      if ($scope.row) {
        var body = $scope.row.body;
        $scope.mode = angular.isString(body) ? CodeEditor.detectTextFormat(body) : "text";
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
    // END

    function onSelectionChanged() {
      var toNode = getStoppedBreakpointId();
      if (toNode) {
        // lets highlight the node in the diagram
        var nodes = getDiagramNodes();
        Camel.highlightSelectedNode(nodes, toNode);
      }
    }

    function reloadData() {
      $scope.debugging = false;
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      if (mbean) {
        $scope.debugging = jolokia.getAttribute(mbean, "Enabled", onSuccess(null));
        if ($scope.debugging) {
          jolokia.execute(mbean, "getBreakpoints", onSuccess(onBreakpoints));
          // get the breakpoints...
          $scope.graphView = "app/camel/html/routes.html";
          $scope.tableView = "app/camel/html/browseMessages.html";

          Core.register(jolokia, $scope, {
            type: 'exec', mbean: mbean,
            operation: 'getDebugCounter'}, onSuccess(onBreakpointCounter));
        } else {
          $scope.graphView = null;
          $scope.tableView = null;
        }
      }
    }

    function onBreakpointCounter(response) {
      var counter = response.value;
      if (counter && counter !== $scope.breakpointCounter) {
        $scope.breakpointCounter = counter;
        loadCurrentStack();
      }
    }

    /*
     * lets load current 'stack' of which breakpoints are active
     * and what is the current message content
     */
    function loadCurrentStack() {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      if (mbean) {
        console.log("getting suspended breakpoints!");
        jolokia.execute(mbean, "getSuspendedBreakpointNodeIds", onSuccess(onSuspendedBreakpointNodeIds));
      }
    }

    function onSuspendedBreakpointNodeIds(response) {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      $scope.suspendedBreakpoints = response;
      $scope.stopped = response && response.length;
      var stopNodeId = getStoppedBreakpointId();
      if (mbean && stopNodeId) {
        jolokia.execute(mbean, 'dumpTracedMessagesAsXml', stopNodeId, onSuccess(onMessages));

        // lets update the diagram selection to the newly stopped node
        $scope.selectedDiagramNodeId = stopNodeId;
      }
      updateBreakpointIcons();
      Core.$apply($scope);
    }

    function onMessages(response) {
      console.log("onMessage! ");
      $scope.messages = [];
      if (response) {
        var xml = response;
        if (angular.isString(xml)) {
          // lets parse the XML DOM here...
          var doc = $.parseXML(xml);
          var allMessages = $(doc).find("fabricTracerEventMessage");
          if (!allMessages || !allMessages.length) {
            // lets try find another element name
            allMessages = $(doc).find("backlogTracerEventMessage");
          }

          allMessages.each((idx, message) => {
            var messageData = Camel.createMessageFromXml(message);
            var toNode = $(message).find("toNode").text();
            if (toNode) {
              messageData["toNode"] = toNode;
            }
            $scope.messages.push(messageData);
          });
        }
      } else {
        console.log("WARNING: dumpTracedMessagesAsXml() returned no results!");
      }

      // lets update the selection and selected row for the message detail view
      updateMessageSelection();
      console.log("has messages " + $scope.messages.length + " selected row " + $scope.row + " index " + $scope.rowIndex);
      Core.$apply($scope);
      updateBreakpointIcons();
    }

    function updateMessageSelection() {
      $scope.selectRowIndex($scope.rowIndex);
      if (!$scope.row && $scope.messageDialog.show) {
        // lets make a dummy empty row
        // so we can keep the detail view while resuming
        $scope.row = {
          headers: {},
          body: ""
        }
      }
    }

    function clearStoppedAndResume() {
      $scope.messages = [];
      $scope.suspendedBreakpoints = [];
      $scope.stopped = false;
      updateMessageSelection();
      Core.$apply($scope);
      updateBreakpointIcons();
    }


    /*
     * Return the current node id we are stopped at
     */
    function getStoppedBreakpointId() {
      var stepNode = null;
      var stepNodes = $scope.suspendedBreakpoints;
      if (stepNodes && stepNodes.length) {
        stepNode = stepNodes[0];
        if (stepNodes.length > 1 && isSuspendedAt($scope.selectedDiagramNodeId)) {
          // TODO should consider we stepping from different nodes based on the call thread or selection?
          stepNode = $scope.selectedDiagramNodeId;
        }
      }
      return stepNode;
    }

    /*
     * Returns true if the execution is currently suspended at the given node
     */
    function isSuspendedAt(nodeId) {
      return containsNodeId($scope.suspendedBreakpoints, nodeId);
    }

    function onBreakpoints(response) {
      $scope.breakpoints = response;
      updateBreakpointFlag();

      // update the breakpoint icons...
      var nodes = getDiagramNodes();
      if (nodes.length) {
        updateBreakpointIcons(nodes);
      }
      Core.$apply($scope);
    }

    /*
     * Returns true if there is a breakpoint set at the given node id
     */
    function isBreakpointSet(nodeId) {
      return containsNodeId($scope.breakpoints, nodeId);
    }

    function updateBreakpointFlag() {
      $scope.hasBreakpoint = isBreakpointSet($scope.selectedDiagramNodeId)
    }

    function containsNodeId(breakpoints, nodeId) {
      return nodeId && breakpoints && breakpoints.some(nodeId);
    }


    function getDiagramNodes() {
      var svg = d3.select("svg");
      return svg.selectAll("g .node");
    }

    var breakpointImage = Core.url("/app/camel/img/breakpoint.gif");
    var suspendedBreakpointImage = Core.url("/app/camel/img/breakpoint-suspended.gif");

    function updateBreakpointIcons(nodes = getDiagramNodes()) {
      nodes.each(function (object) {
        // add breakpoint icon
        var nodeId = object.cid;
        var thisNode = d3.select(this);
        var icons = thisNode.selectAll("image.breakpoint");
        var isSuspended = isSuspendedAt(nodeId);
        var isBreakpoint = isBreakpointSet(nodeId);
        if (isBreakpoint || isSuspended) {
          var imageUrl = isSuspended ? suspendedBreakpointImage : breakpointImage;
          // lets add an icon image if we don't already have one
          if (!icons.length || !icons[0].length) {
            thisNode.append("image")
                    .attr("xlink:href", function (d) {
                      return imageUrl;
                    })
                    .attr("class", "breakpoint")
                    .attr("x", -12)
                    .attr("y", -20)
                    .attr("height", 24)
                    .attr("width", 24);
          } else {
            icons.attr("xlink:href", function (d) {
              return imageUrl;
            });
          }
        } else {
          icons.remove();
        }
      });
    }


    function breakpointsChanged(response) {
      reloadData();
      Core.$apply($scope);
    }

    function setDebugging(flag:Boolean) {
      var mbean = getSelectionCamelDebugMBean(workspace, camelJmxDomain);
      if (mbean) {
        var method = flag ? "enableDebugger" : "disableDebugger";
        var max = Camel.maximumTraceOrDebugBodyLength(localStorage);
        var streams = Camel.traceOrDebugIncludeStreams(localStorage);
        jolokia.setAttribute(mbean, "BodyMaxChars", max);
        jolokia.setAttribute(mbean, "BodyIncludeStreams", streams);
        jolokia.setAttribute(mbean, "BodyIncludeFiles", streams);
        jolokia.execute(mbean, method, onSuccess(breakpointsChanged));
      }
    }
  }]);
}
