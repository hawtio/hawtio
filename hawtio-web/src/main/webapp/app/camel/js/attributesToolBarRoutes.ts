module Camel {
  export function AttributesToolBarRoutesController($scope, workspace:Workspace, jolokia) {

    $scope.start = () => {
      $scope.invokeSelectedMBeans("start()");
    };

    $scope.stop = () => {
      $scope.invokeSelectedMBeans("stop()");
    };

    $scope.delete = () => {
      $scope.invokeSelectedMBeans("remove()", () => {
        // force a reload of the tree
        console.log("About to force reload of the tree");
        $scope.workspace.operationCounter += 1;
        $scope.$apply();
      });
    };

    $scope.selectionsState = (state) => {
      var selected = $scope.selectedItems || [];
      return selected.length && selected.every((s) => {
        return (s.State || "").toLowerCase().startsWith(state);
      });
    }
  }
}