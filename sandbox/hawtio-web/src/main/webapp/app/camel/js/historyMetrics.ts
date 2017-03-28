/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.MessageHistoryMetricsController", ["$scope", "$location", "workspace", "jolokia", "metricsWatcher", "localStorage", ($scope, $location, workspace:Workspace, jolokia, metricsWatcher, localStorage:WindowLocalStorage) => {
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    var log:Logging.Logger = Logger.get("Camel");

    $scope.workspace = workspace;

    $scope.maxSeconds = Camel.routeMetricMaxSeconds(localStorage);

    $scope.filterText = null;
    $scope.initDone = false;
    $scope.metricDivs = [];

    $scope.filterByRoute = (div) => {
      log.debug("Filter by route/node " + div);

      // match by route first, and then node id
      var match = Core.matchFilterIgnoreCase(div.routeId, $scope.filterText);
      if (!match) {
        match = Core.matchFilterIgnoreCase(div.nodeId, $scope.filterText);
      }

      if (!match) {
        // hide using CSS style
        return "display: none;"
      } else {
        return "";
      }
    };

    function populateMessageHistoryStatistics(response) {
      var obj = response.value;
      if (obj) {
        // turn into json javascript object which metrics watcher requires
        var json = JSON.parse(obj);

        if (!$scope.initDone) {
          // figure out which routes we have
          var meters = json['timers'];

          var counter = 0;
          if (meters != null) {
            for (var v in meters) {
              var key = v;

              // "camel-id.route-id.node-id.history"
              var lastDot = key.lastIndexOf(".");
              var className = key.substr(0, lastDot);
              var metricsName = key.substr(lastDot + 1);
              // route
              var routeId = className.substr(className.indexOf(".") + 1);
              routeId = routeId.substr(0, routeId.indexOf("."));
              var nodeId = className.substr(className.lastIndexOf(".") + 1);
              var entry = meters[v];
              var div = "timer-" + counter;
              $scope.metricDivs.push({
                id: div,
                routeId: routeId,
                nodeId: nodeId
              });

              counter++;

              log.info("Added timer: " + div + " (" + className + "." + metricsName + ") for route: " + routeId + " node: " + nodeId + " with max seconds: " + $scope.maxSeconds);
              metricsWatcher.addTimer(div, className, metricsName, $scope.maxSeconds, nodeId, "Histogram", $scope.maxSeconds * 1000);
            }

            // ensure web page is updated at this point, as we need the metricDivs in the HTML before we call init graphs later
            log.info("Pre-init graphs");
            Core.$apply($scope);
          }

          log.info("Init graphs");
          metricsWatcher.initGraphs();
        }

        $scope.initDone = true;

        // update graphs
        log.debug("Updating graphs: " + json);
        metricsWatcher.updateGraphs(json)
      }

      $scope.initDone = true;

      // ensure web page is updated
      Core.$apply($scope);
    }

    // function to trigger reloading page
    $scope.onResponse = function (response) {
      loadData();
    };

    $scope.$watch('workspace.tree', function () {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    });

    function loadData() {
      log.info("Loading RouteMetrics data...");

      // pre-select filter if we have selected a route
      var routeId = getSelectedRouteId(workspace);
      if (routeId != null) {
        $scope.filterText = routeId;
      }

      var mbean = getSelectionCamelMessageHistoryMetrics(workspace, camelJmxDomain);
      if (mbean) {
        var query = {type: 'exec', mbean: mbean, operation: 'dumpStatisticsAsJson'};
        scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(populateMessageHistoryStatistics, query));
      } else {
        $scope.initDone = true;

        // ensure web page is updated
        Core.$apply($scope);
      }
    }

  }]);

}
