/**
 * @module Jclouds
 */
/// <reference path="../jcloudsPlugin.ts"/>
module Jclouds {
    _module.controller("Jclouds.NodeListController", ["$scope", "$location", "workspace", "jolokia", "$routeParams", ($scope, $location, workspace, jolokia, $routeParams) => {
        $scope.computeId = $routeParams.computeId;

        $scope.result = {};
        $scope.nodes = [];

        $scope.group = "";
        $scope.groups = [];

        $scope.location = "";
        $scope.locations = [];

        var grp = $location.search()['group'];
        if (grp) {
            $scope.group = grp;
        }

        var loc = $location.search()['location'];
        if (loc) {
            $scope.location = loc;
        }

        // selected nodes
        $scope.selectedNodes = [];

      /*
        var SearchProvider = function (scope, location) {
            var self = this;
            self.scope = scope;
            self.location = location;

            self.callback = function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                self.scope.nodes = filterNodes(self.scope.nodes, self.scope.group, self.scope.location);
                self.scope.group = setSelect(self.scope.group, self.scope.groups);
                self.scope.location = setSelect(self.scope.location, self.scope.locations);

                var q = location.search();
                q['group'] = self.scope.group;
                q['location'] = self.scope.location;
                location.search(q);
                self.evalFilter();
            };

            self.scope.$watch('group', self.callback);
            self.scope.$watch('location', self.callback);

            self.init = function (childScope, grid) {
                self.grid = grid;
                self.childScope = childScope;
                grid.searchProvider = self;
            };

            self.evalFilter = function () {
                var byGroup = self.grid.sortedData;
                if (self.scope.group !== "") {
                    byGroup = self.grid.sortedData.findAll(function (item) {
                        return item["group"] === self.scope.group
                    });
                }

                var byLocation = byGroup;
                if (self.scope.location !== "") {
                    byLocation = self.grid.sortedData.findAll(function (item) {
                        return item["locationId"] === self.scope.location
                    });
                }

                self.grid.filteredData = byLocation;
                self.grid.rowFactory.filteredDataChanged();
            };
        }

        var searchProvider = new SearchProvider($scope, $location);
      */

        $scope.nodeTable = {
            //plugins: [searchProvider],
            data: 'nodes',
            showFilter: false,
            showColumnMenu: false,
            filterOptions: {
                useExternalFilter: true
            },
            selectedItems: $scope.selectedNodes,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'Id',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/compute/node/{{computeId}}/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'group',
                    displayName: 'Group',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/compute/node/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'operatingSystem.family',
                    displayName: 'Operating System',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200
                },
                {
                    field: 'locationId',
                    displayName: 'Location',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 200
                },
                {
                    field: 'hostname',
                    displayName: 'Host Name',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 300
                }
            ]
        };

        Core.register(jolokia, $scope, {
            type: 'exec', mbean: getSelectionJcloudsComputeMBean(workspace, $scope.computeId), operation: 'listNodes()'
        }, onSuccess(render));


        function render(response) {
            if (!Object.equal($scope.result, response.value)) {
                $scope.result = response.value;
                $scope.nodes = $scope.result
                $scope.locations = extractLocations($scope.nodes)
                $scope.groups = extractGroups($scope.nodes)
                Core.$apply($scope);
            }
        }

        function extractGroups(nodes) {
            var groups = [];
            groups.push("")
            angular.forEach(nodes, (node) => {
                var group = node["group"];
                groups.push(group)
            });
            return groups.unique();
        }

        function extractLocations(nodes) {
            var locations = [];
            locations.push("")
            angular.forEach(nodes, (node) => {
                var location = node["locationId"];
                locations.push(location)
            });
            return locations.unique();
        }

        $scope.resume = () => {
            $scope.selectedNodes.forEach(function (node) {
                resumeNode(workspace,jolokia, $scope.computeId, node.id, function() {console.log("Resumed!")}, function() {console.log("Failed to resume!")});
            });
        }

        $scope.suspend = () => {
            $scope.selectedNodes.forEach(function (node) {
                suspendNode(workspace,jolokia, $scope.computeId, node.id, function() {console.log("Suspended!")}, function() {console.log("Failed to suspend!")});
            });
        }

        $scope.reboot = () => {
            $scope.selectedNodes.forEach(function (node) {
                rebootNode(workspace,jolokia, $scope.computeId, node.id, function() {console.log("Rebooted!")}, function() {console.log("Failed to reboot!")});
            });
        }

        $scope.destroy = () => {
            $scope.selectedNodes.forEach(function (node) {
                destroyNode(workspace,jolokia, $scope.computeId, node.id, function() {console.log("Destroyed!")}, function() {console.log("Failed to destroy!")});
            });
        }
    }]);
}
