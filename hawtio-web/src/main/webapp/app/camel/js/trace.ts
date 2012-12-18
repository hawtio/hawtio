function TraceRouteController($scope, workspace:Workspace) {
  $scope.tracing = false;
  var jolokia = workspace.jolokia;

  function tracingChanged(response) {
    console.log("tracing state changed");
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
    var mbean = workspace.getSelectedMBeanName();
    if (mbean) {
      $scope.tracing = jolokia.execute(mbean, 'getTracing()');
    }
  }

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;
    reloadTracingFlag();
  });

}