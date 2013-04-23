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
      var routeXmlNode = getSelectedRouteNode(workspace);
      $scope.mbean = getSelectionCamelContextMBean(workspace);
      if (routeXmlNode) {
        $scope.source = Core.xmlNodeToString(routeXmlNode);
        Core.$apply($scope);
      } else if ($scope.mbean) {
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
    };
    
    var saveWorked = () => {
      notification("success", "Route updated!");
      // lets clear the cached route XML so we reload the new value
      clearSelectedRouteNode(workspace);
      updateRoutes();
    };

    $scope.saveRouteXml = () => {
      var routeXml = $scope.source;
      if (routeXml) {
        var jolokia = workspace.jolokia;
        var mbean = getSelectionCamelContextMBean(workspace);
        if (mbean) {
          jolokia.execute(mbean, "addOrUpdateRoutesFromXml(java.lang.String)", routeXml, onSuccess(saveWorked));
        } else {
          notification("error", "Could not find CamelContext MBean!");
        }
      }
    };
  }
}



