/**
 * @module Maven
 */
module Maven {

  export function ViewController($scope, $location, workspace:Workspace, jolokia) {
    $scope.$watch('workspace.tree', function () {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      setTimeout(loadData, 50);
    });


    function loadData() {
    }
  }
}
