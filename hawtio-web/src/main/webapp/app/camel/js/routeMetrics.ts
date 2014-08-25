/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.RouteMetricsController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace:Workspace, jolokia) => {

    $scope.filterText = null;

    $scope.data = null;
    $scope.initDone = false;
    $scope.metricDivs = "";

    // TODO: figure out how to init this better
    $scope.metricsWatcher = window.metricsWatcher;

    function populateRouteStatistics(response) {
      var obj = response.value;
      if (obj) {
        // turn into json javascript object which metrics watcher requires
        var json = JSON.parse(obj);

        // so we can see the json string
        $scope.data = obj;

        if (!$scope.initDone) {
          // figure out which routes we have
          var meters = json['timers']

          var counter = 0;
          if (meters != null) {
            for (var v in meters) {
              var key = v;
              var entry = meters[v];
              var div = "meter-" + counter;
              counter++;

              metricsWatcher.addTimer(div, key, "responses", 1, key, "responses", 1);

              $scope.metricDivs += "<div id=\"" + div + "\" class=\"row\"></div>";
            }
          }

          $scope.metricsWatcher.initGraphs();
          $scope.initDone = true;
        }

        // update graphs
        console.log("Updating graphs")
        $scope.metricsWatcher.updateGraphs(json)

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
      console.log("Loading RouteMetrics data...");
      var mbean = getSelectionCamelRouteMetrics(workspace);
      if (mbean) {
        var query = {type: 'exec', mbean: mbean, operation: 'dumpStatisticsAsJson'};
        scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(populateRouteStatistics, query));
      }
    }

  }]);

}
