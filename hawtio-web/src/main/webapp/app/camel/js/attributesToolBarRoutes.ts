module Camel {
  export function AttributesToolBarRoutesController($scope, workspace:Workspace, jolokia) {

    $scope.start = () => {
      $scope.invokeSelectedMBeans("start()");
    };

    $scope.stop = () => {
      $scope.invokeSelectedMBeans("stop()");
    };

    $scope.delete = () => {
      console.log("Deleting the selected routes!");
    };

    $scope.selectionsState = (state) => {
      var selected = $scope.selectedItems || [];
      return selected.length && selected.every((s) => {
        return (s.State || "").toLowerCase().startsWith(state);
      });
    }
  }
}