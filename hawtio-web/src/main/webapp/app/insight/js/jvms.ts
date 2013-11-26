/**
 * @module Insight
 */
module Insight {

    export function JVMsController($scope, jolokia, localStorage) {

        $scope.time_options = ['1m','5m','15m','1h','6h','12h'];
        $scope.timespan = '1m';
        $scope.containers = [];
        $scope.profiles = [ allContainers ];
        $scope.versions = [];
        $scope.profile = allContainers;

        $scope.metrics = [];
        $scope.updateRate = parseInt(localStorage['updateRate']);
        $scope.data = [];

        var chartsMeta = [ { name: "threads", type: "sta-jvm", field: "threads.count" },
                           { name: "mem",     type: "sta-jvm", field: "mem.heap_used" } ];
        var mainDiv = "#charts";

        $scope.set_timespan = function(t) {
            $scope.timespan = t;
            rebuildCharts();
        }

        $scope.profile_changed = function() {
            rebuildCharts();
        }

        Core.register(jolokia, $scope, {
            type: 'exec', mbean: managerMBean,
            operation: 'containers()',
            arguments: []
        }, onSuccess(onContainers));

        function onContainers(response) {
            if (!Object.equal($scope.result, response.value)) {
                $scope.result = response.value;
                $scope.containers = [];
                $scope.profiles = [ allContainers ];
                $scope.versions = [];
                $scope.result.forEach(function (container) {
                    $scope.profiles = $scope.profiles.union(container.profileIds.map(function(id) { return { id: id }; }));
                    $scope.versions = $scope.versions.union([ container.versionId ]);
                    $scope.containers.push({
                        name: container.id,
                        alive: container.alive,
                        version: container.versionId,
                        profileIds: container.profileIds
                    });
                });
                Core.$apply($scope);
                rebuildCharts();
            }
        }

        function rebuildCharts() {
            var chartsDef = [ ];
            chartsMeta.forEach(function(meta) {
                $scope.containers.forEach(function(container) {
                    if ($scope.profile === allContainers || $.inArray($scope.profile.id, container.profileIds) >= 0) {
                        chartsDef.push( {
                            name: meta.name + " [" + container.name + "]",
                            type: meta.type,
                            field: meta.field,
                            query: "host: \"" + container.name + "\""
                        });
                    }
                });
            });
            createCharts($scope, chartsDef, mainDiv, jolokia);
        }
    }

}
