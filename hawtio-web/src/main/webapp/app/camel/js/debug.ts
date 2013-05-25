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
      console.log("the selected diagram node is now " + $scope.selectedDiagramNodeId);

      // TODO set hasBreakpoint if value is true and it has a breakpoint right now!!!
      $scope.hasBreakpoint = false;
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


    function reloadData() {
      $scope.debugging = false;
      // clear any previous polls

      var mbean = getSelectionCamelDebugMBean(workspace);
      if (mbean) {
        $scope.debugging = jolokia.getAttribute(mbean, "Enabled", onSuccess(null));
        if ($scope.debugging) {
          // get the breakpoints...
          $scope.graphView = "app/camel/html/routes.html";
          //$scope.tableView = "app/camel/html/browseMessages.html";
        } else {
          $scope.graphView = null;
          $scope.tableView = null;
        }
      }
    }

    function debuggingChanged(response) {
      reloadData();
      $scope.$apply();
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
