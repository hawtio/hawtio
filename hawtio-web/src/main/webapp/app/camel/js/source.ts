module Camel {
  export function SourceController($scope, workspace:Workspace) {

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateRoutes, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      updateRoutes();
    });

    var options = {
      mode: {
        name: 'xml'
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    function updateRoutes() {
      $scope.mbean = getSelectionCamelContextMBean(workspace);
      if ($scope.mbean) {
        var jolokia = workspace.jolokia;
        jolokia.request(
                {type: 'exec', mbean: $scope.mbean, operation: 'dumpRoutesAsXml()'},
                onSuccess(populateTable));
      }
    }

    var populateTable = function (response) {
      var data = response.value;
      var selectedRouteId = getSelectedRouteId(workspace);
      if (data && selectedRouteId) {
        var doc = $.parseXML(data);
        var routes = $(doc).find('route[id="' + selectedRouteId + '"]');
        if (routes && routes.length) {
          var selectedRoute = routes[0];
          // TODO turn into XML?
          var routeXml = Core.xmlNodeToString(selectedRoute);
          if (routeXml) {
            data = routeXml;
          }
        }
      }
      $scope.source = data;
      $scope.$apply();
    }
  }
}



