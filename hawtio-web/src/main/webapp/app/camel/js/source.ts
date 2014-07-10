/// <reference path="camelPlugin.ts"/>
module Camel {
  _module.controller("Camel.SourceController", ["$scope", "workspace", ($scope, workspace:Workspace) => {

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateRoutes, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      updateRoutes();
    });

    $scope.mode = 'xml';

    function getSource(routeXmlNode) {
      function removeCrappyHeaders(idx, e) {
        var answer = e.getAttribute("customId");
        if (e.nodeName === 'route') {
          // always keep id on <route> element
          answer = "true";
        }
        if (!answer || answer !== "true") {
          e.removeAttribute("id");
        }
        // just always remove customId, _cid, and group
        e.removeAttribute("customId");
        e.removeAttribute("_cid");
        e.removeAttribute("group");
      }
      var copy = $(routeXmlNode).clone();
      copy.each(removeCrappyHeaders);
      copy.find("*").each(removeCrappyHeaders);
      var newNode = (copy && copy.length) ? copy[0] : routeXmlNode;
      return Core.xmlNodeToString(newNode);
    }

    function updateRoutes() {
      // did we select a single route
      var routeXmlNode = getSelectedRouteNode(workspace);
      if (routeXmlNode) {
        $scope.source = getSource(routeXmlNode);
        Core.$apply($scope);
      } else {
        // no then try to find the camel context and get all the routes code
        $scope.mbean = getSelectionCamelContextMBean(workspace);
        if (!$scope.mbean) {
          // maybe the parent is the camel context folder (when we have selected the routes folder),
          // then grab the object name from parent
          var parent: any = Core.pathGet(workspace, ["selection", "parent"]);
          if (parent && parent.title === "context") {
            $scope.mbean = parent.children[0].objectName;
          }
        }
        if ($scope.mbean) {
          var jolokia = workspace.jolokia;
          jolokia.request(
            {type: 'exec', mbean: $scope.mbean, operation: 'dumpRoutesAsXml()'},
            onSuccess(populateTable));
        }
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
          var routeXml = getSource(selectedRoute);
          if (routeXml) {
            data = routeXml;
          }
        }
      }
      $scope.source = data;
      Core.$apply($scope);
    };
    
    var saveWorked = () => {
      Core.notification("success", "Route updated!");
      // lets clear the cached route XML so we reload the new value
      clearSelectedRouteNode(workspace);
      updateRoutes();
    };

    $scope.saveRouteXml = () => {
      var routeXml = $scope.source;
      if (routeXml) {
        var decoded = decodeURIComponent(routeXml);
        log.debug("addOrUpdateRoutesFromXml xml decoded: " + decoded);
        var jolokia = workspace.jolokia;
        var mbean = getSelectionCamelContextMBean(workspace);
        if (mbean) {
          jolokia.execute(mbean, "addOrUpdateRoutesFromXml(java.lang.String)", decoded, onSuccess(saveWorked));
        } else {
          Core.notification("error", "Could not find CamelContext MBean!");
        }
      }
    };
  }]);
}



