module Camel {
  export function DebugRouteController($scope, workspace:Workspace, jolokia) {
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
      //console.log("the selected diagram node is now " + $scope.selectedDiagramNodeId);
      updateBreakpointFlag();
    });

    $scope.$on("camel.diagram.layoutComplete", (event, value) => {
      updateBreakpointIcons(getDiagramNodes());
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      reloadData();
    });

    $scope.addBreakpoint = () => {
      var mbean = getSelectionCamelDebugMBean(workspace);
      if (mbean && $scope.selectedDiagramNodeId) {
        console.log("adding breakpoint on " + $scope.selectedDiagramNodeId);
        jolokia.execute(mbean, "addBreakpoint", $scope.selectedDiagramNodeId, onSuccess(debuggingChanged));
      }
    };

    $scope.removeBreakpoint = () => {
      var mbean = getSelectionCamelDebugMBean(workspace);
      if (mbean && $scope.selectedDiagramNodeId) {
        console.log("removing breakpoint on " + $scope.selectedDiagramNodeId);
        jolokia.execute(mbean, "removeBreakpoint", $scope.selectedDiagramNodeId, onSuccess(debuggingChanged));
      }
    };

    $scope.resume = () => {
      var mbean = getSelectionCamelDebugMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, "resumeAll", onSuccess(stepChanged));
      }
    };

    $scope.suspend = () => {
      var mbean = getSelectionCamelDebugMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, "suspendAll", onSuccess(stepChanged));
      }
    };

    $scope.step = () => {
      var mbean = getSelectionCamelDebugMBean(workspace);
      // TODO we should use the first stepped node?
      var stepNode = $scope.selectedDiagramNodeId;
      if (mbean && stepNode) {
        console.log("stepping from breakpoint on " + stepNode);
        jolokia.execute(mbean, "step", stepNode, onSuccess(stepChanged));
      }
    };


    function reloadData() {
      $scope.debugging = false;
      var mbean = getSelectionCamelDebugMBean(workspace);
      if (mbean) {
        $scope.debugging = jolokia.getAttribute(mbean, "Enabled", onSuccess(null));
        if ($scope.debugging) {
          jolokia.execute(mbean, "getBreakpoints", onSuccess(onBreakpoints));
          // get the breakpoints...
          $scope.graphView = "app/camel/html/routes.html";
          //$scope.tableView = "app/camel/html/browseMessages.html";
        } else {
          $scope.graphView = null;
          $scope.tableView = null;
        }
      }
    }

    function onBreakpoints(response) {
      $scope.breakpoints = response;
      console.log("got breakpoints " + JSON.stringify(response));
      updateBreakpointFlag();

      // update the breakpoint icons...
      var nodes = getDiagramNodes();
      if (nodes.length) {
        updateBreakpointIcons(nodes);
      }
      Core.$apply($scope);
    }

    function getDiagramNodes() {
      var svg = d3.select("svg");
      return svg.selectAll("g .node");
    }

    var breakpointImage = url("/app/camel/img/debug/breakpoint.gif");

    function updateBreakpointIcons(nodes) {
      nodes.each(function (object) {
        // add breakpoint icon
        var nodeId = object.cid;
        var thisNode = d3.select(this);
        var icons = thisNode.selectAll("image.breakpoint");
        if (isBreakpointSet(nodeId)) {
          // lets add an icon image if we don't already have one
          if (!icons.length || !icons[0].length) {
            thisNode.append("image")
                    .attr("xlink:href", function (d) {
                      return breakpointImage;
                    })
                    .attr("class", "breakpoint")
                    .attr("x", -12)
                    .attr("y", -20)
                    .attr("height", 24)
                    .attr("width", 24);
          }
        } else {
          icons.remove();
        }
      });
    }

    function updateBreakpointFlag() {
      $scope.hasBreakpoint = isBreakpointSet($scope.selectedDiagramNodeId)
    }

    /**
     * Returns true if there is a breakpoint set at the given node id
     */
    function isBreakpointSet(nodeId) {
      var breakpoints = $scope.breakpoints;
      return nodeId && breakpoints && breakpoints.some(nodeId);
    }

    function debuggingChanged(response) {
      reloadData();
      Core.$apply($scope);
    }

    function stepChanged(response) {
      // TODO lets reload everything, though probably just polling the current
      // paused state is enough...
      reloadData();
      Core.$apply($scope);
    }

    function setDebugging(flag:Boolean) {
      var mbean = getSelectionCamelDebugMBean(workspace);
      if (mbean) {
        var method = flag ? "enableDebugger" : "disableDebugger";
        jolokia.execute(mbean, method, onSuccess(debuggingChanged));
      }
    }
  }
}
