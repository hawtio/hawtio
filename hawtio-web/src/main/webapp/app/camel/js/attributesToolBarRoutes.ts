module Camel {

  export function AttributesToolBarRoutesController($scope, workspace:Workspace, jolokia) {

    $scope.start = () => {
      $scope.invokeSelectedMBeans((item) => {
        return isState(item, "suspend") ? "resume()" :"start()";
      });
    };

    $scope.pause = () => {
      $scope.invokeSelectedMBeans("suspend()");
    };

    $scope.stop = () => {
      $scope.invokeSelectedMBeans("stop()");
    };

    $scope.delete = () => {
      $scope.invokeSelectedMBeans("remove()", () => {
        // force a reload of the tree
        $scope.workspace.operationCounter += 1;
        $scope.$apply();
      });
    };

    $scope.selectionsState = (state) => {
      var selected = $scope.selectedItems || [];
      return selected.length && selected.every((s) => isState(s, state));
    }
  }
}