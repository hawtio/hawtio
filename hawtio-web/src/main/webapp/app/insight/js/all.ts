module Insight {

    export function AllController($scope, jolokia, localStorage) {

        $scope.containers = [];
        $scope.profiles = [ allContainers ];
        $scope.versions = [];
        $scope.profile = allContainers;

        $scope.timespan = '1m';
        $scope.updateRate = parseInt(localStorage['updateRate']);

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
                $scope.$apply();
            }
        }

        var jreq = { type: 'exec',
                     mbean: 'org.elasticsearch:service=restjmx',
                     operation: 'exec',
                     arguments: [ 'GET', '/_all/_mapping', null ] };

        jolokia.request(jreq, { success: function(response) {
            var data = jQuery.parseJSON(response.value);
            var roots = { };
            var children = [ ];
            for (var index in data) {
                if (index.startsWith("insight-")) {
                    for (var mapping in data[index]) {
                        if (mapping.startsWith("sta-")) {
                            var name = mapping.substring(4);
                            if (!roots[name]) {
                                roots[name] = true;
                                children.push( {
                                    title: name,
                                    children: getChildren(
                                                data[index][mapping],
                                                name, "",
                                                data[index][mapping]["properties"]["host"] !== undefined)
                                } );
                            }
                        }
                    }
                }
            }
            $("#insighttree").dynatree({
                title: "Metrics",
                onActivate: function (node) {
                    var data = node.data;
                    buildCharts(data["field"], data["type"], data["hasHost"]);
                },
                children: children
            });
        } });

        function buildCharts(field, type, hasHost) {
            var chartsDef = [ ];
            if (hasHost) {
                $scope.containers.forEach(function(container) {
                    if ($scope.profile === allContainers || $.inArray($scope.profile.id, container.profileIds) >= 0) {
                        chartsDef.push( {
                            name: container.name,
                            type: "sta-" + type,
                            field: field,
                            query: "host: \"" + container.name + "\""
                        });
                    }
                });
            } else {
                chartsDef.push({
                    name: field,
                    type: "sta-" + type,
                    field: field
                });
            }
            createCharts($scope, chartsDef, "#charts", jolokia);
        }

    }

    function getChildren(node, type, field, hasHost) {
        var children = [ ];
        for (var p in node["properties"]) {
            var obj = node["properties"][p];
            if (obj["type"] === 'long' || obj["type"] === 'double') {
                children.push( { title: p, field: field + p, type: type, hasHost: hasHost } );
            } else if (obj["properties"]) {
                children.push( { title: p, isFolder: true, children: getChildren(obj, type, field + p + ".", hasHost) } );
            }
        }
        return children;
    }
}
