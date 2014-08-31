/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.RouteMetricsController", ["$scope", "$location", "workspace", "jolokia", "metricsWatcher", ($scope, $location, workspace:Workspace, jolokia, metricsWatcher) => {

    var log:Logging.Logger = Logger.get("Camel");

    // TODO: filterText should filter per route name in the UI
    // TODO: allow to configure the max value in seconds, and also show the setting in the ui etc
    // TODO: if there is no routes

    var maxSeconds = 5;

    $scope.filterText = null;
    $scope.data = null;
    $scope.initDone = false;
    $scope.metricDivs = [];

    function populateRouteStatistics(response) {
      var obj = response.value;
      if (obj) {
        // turn into json javascript object which metrics watcher requires
        var json = JSON.parse(obj);

        // so we can see the json string
        $scope.data = obj;

        if (!$scope.initDone) {
          // figure out which routes we have
          var meters = json['timers'];

          var counter = 0;
          if (meters != null) {
            for (var v in meters) {
              var key = v;

              var lastDot = key.lastIndexOf(".");
              var className = key.substr(0, lastDot);
              var metricsName = key.substr(lastDot + 1);
              var firstColon = key.indexOf(":");

              // compute route id from the key, which is text after the 1st colon, and the last dot
              var routeId = key.substr(firstColon + 1);
              lastDot = routeId.lastIndexOf(".");
              if (lastDot > 0) {
                routeId = routeId.substr(0, lastDot);
              }

              var entry = meters[v];
              var div = "timer-" + counter;
              $scope.metricDivs.push(div);

              counter++;

              log.info("Added timer: " + div + " (" + className + "." + metricsName + ") for route: " + routeId);
              metricsWatcher.addTimer(div, className, metricsName, maxSeconds, routeId, "responses", maxSeconds * 1000);
            }

            // ensure web page is updated at this point, as we need the metricDivs in the HTML before we call init graphs later
            log.info("Pre-init graphs")
            Core.$apply($scope);
          }

          log.info("Init graphs")
          metricsWatcher.initGraphs();
          $scope.initDone = true;
        }

        // update graphs
        log.debug("Updating graphs: " + json)
        metricsWatcher.updateGraphs(json)

        // ensure web page is updated
        Core.$apply($scope);
      }
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
      var mbean = getSelectionCamelRouteMetrics(workspace);
      if (mbean) {
        var query = {type: 'exec', mbean: mbean, operation: 'dumpStatisticsAsJson'};
        scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(populateRouteStatistics, query));
      }
    }

  }]);

}
