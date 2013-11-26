/**
 * @module Insight
 */
module Insight {

    export function AllController($scope, jolokia, localStorage) {

        $scope.result = null;
        $scope.containers = [];
        $scope.profiles = [ allContainers ];
        $scope.versions = [];
        $scope.profile = allContainers;

        $scope.time_options = ['1m','5m','15m','1h','6h','12h'];
        $scope.timespan = '1m';
        $scope.updateRate = parseInt(localStorage['updateRate']);

        $scope.chartsMeta = [ ];

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
            }
        }

        $scope.metrics = jQuery.parseJSON(jolokia.getAttribute("org.fusesource.insight:type=MetricsCollector", "Metrics"));

        var jreq = { type: 'exec',
                     mbean: 'org.elasticsearch:service=restjmx',
                     operation: 'exec',
                     arguments: [ 'GET', '/_all/_mapping', '' ] };

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
                                    expand: true,
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
                checkbox: true,
                selectMode: 2,
                onSelect: onSelect,
                onClick: onClick,
                onKeydown: onKeydown,
                children: children
            });
        } });

        $scope.set_timespan = function(t) {
            $scope.timespan = t;
            rebuildCharts();
        }

        $scope.profile_changed = function() {
            rebuildCharts();
        }

        function onSelect(flag, node) {
            var selNodes = node.tree.getSelectedNodes();
            $scope.chartsMeta = selNodes.map(function(node) {
                var data = node.data;
                return { name: data["field"], field: data["field"], type: data["type"], host: data["hasHost"] }
            });
            rebuildCharts();
        }

        function onClick(node:DynaTreeNode, event:Event) {
            // We should not toggle, if target was "checkbox", because this
            // would result in double-toggle (i.e. no toggle)
            if( node.getEventTargetType(event) === "title" ) {
                node.toggleSelect();
            }
            return true;

        }

        function onKeydown(node, event) {
            if( event.which === 32 ) {
                node.toggleSelect();
                return false;
            }
        }

        function rebuildCharts() {
            var chartsDef = [ ];
            $scope.chartsMeta.forEach(function(meta) {
                var metadata = $scope.metrics[meta.type] !== undefined ? $scope.metrics[meta.type][meta.field] : undefined;
                if (meta.host) {
                    $scope.containers.forEach(function(container) {
                        if ($scope.profile === allContainers || $.inArray($scope.profile.id, container.profileIds) >= 0) {
                            chartsDef.push({
                                name: (metadata !== undefined ? metadata['description'] : meta.name) + " [" + container.name + "]",
                                type: "sta-" + meta.type,
                                field: meta.field,
                                query: "host: \"" + container.name + "\"",
                                meta: metadata
                            });
                        }
                    });
                } else {
                    chartsDef.push( {
                        name: metadata !== undefined ? metadata['description'] : meta.name,
                        type: "sta-" + meta.type,
                        field: meta.field,
                        meta: metadata
                    });
                }
            });
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
