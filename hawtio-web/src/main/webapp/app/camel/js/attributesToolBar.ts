/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.AttributesToolBarController", ["$scope", "workspace", "jolokia", "localStorage", ($scope, workspace:Workspace, jolokia, localStorage) => {
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.camelContextMBean = getSelectionCamelContextMBean(workspace, camelJmxDomain);
    $scope.routeMBean = searchRouteMBean();

    $scope.deleteDialog = false

    $scope.start = () => {
      $scope.invokeSelectedMBeans((item) => {
        return isState(item, "suspend") ? "resume()" :"start()";
      });
    };

    $scope.pause = () => {
      $scope.invokeSelectedMBeans("suspend()");
    };

    $scope.stop = () => {
      $scope.invokeSelectedMBeans("stop()", () => {
        // lets navigate to the parent folder!
        // as this will be going way
        workspace.removeAndSelectParentNode();
        Core.$apply($scope);
      });
    };

    /*
     * Only for routes!
     */
    $scope.delete = () => {
      $scope.invokeSelectedMBeans("remove()", () => {
        // force a reload of the tree
        if ($scope.workspace) {
          $scope.workspace.operationCounter += 1;
        }
        Core.$apply($scope);
      });
    };

    $scope.anySelectionHasState = (state) => {
      var selected = $scope.selectedItems || [];
      return selected.length && selected.any((s) => isState(s, state));
    };

    $scope.everySelectionHasState = (state) => {
      var selected = $scope.selectedItems || [];
      return selected.length && selected.every((s) => isState(s, state));
    };

    function searchRouteMBean() {
      var routeId = getSelectedRouteId(workspace);
      if (!routeId) {
        // parent may have the route
        routeId = getSelectedRouteId(workspace, workspace.selection.parent);
      }
      if (!routeId) {
        // forces selecting one route so that RBAC can be determined
        var children = workspace.selection.children;
        if (children && children.length > 0) {
          routeId = getSelectedRouteId(workspace, children[0])
        }
      }
      return getSelectionRouteMBean(workspace, routeId, camelJmxDomain);
    }
  }]);

}
