/**
 * @module Insight
 */
module Insight {

    export function ElasticSearchController($scope, jolokia, localStorage) {

        $scope.time_options = ['1m','5m','15m','1h','6h','12h'];
        $scope.timespan = '1m';

        $scope.metrics = [];
        $scope.updateRate = parseInt(localStorage['updateRate']);
        $scope.data = [];

        var chartsDef = [ { name: "active primary shards", type: "sta-elasticsearch", field: "active_primary_shards" },
                          { name: "active shards",         type: "sta-elasticsearch", field: "active_shards" },
                          { name: "relocating shards",     type: "sta-elasticsearch", field: "relocating_shards" },
                          { name: "initializing shards",   type: "sta-elasticsearch", field: "initializing_shards" },
                          { name: "unassigned shards",     type: "sta-elasticsearch", field: "unassigned_shards" } ];
        var mainDiv = "#charts";

        $scope.set_timespan = function(t) {
            $scope.timespan = t;
            rebuildCharts();
        }

        rebuildCharts();

        function rebuildCharts() {
            createCharts($scope, chartsDef, mainDiv, jolokia);
        }
    }
}
