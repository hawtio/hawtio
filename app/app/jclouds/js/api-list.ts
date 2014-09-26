/**
 * @module Jclouds
 */
/// <reference path="./jcloudsPlugin.ts"/>
module Jclouds {
    _module.controller("Jclouds.ApiListController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace, jolokia) => {

        $scope.result = {};
        $scope.apis = [];
        $scope.type = ""
        $scope.types = ["", "blobstore", "compute", "loadbalancer"];

        var key = $location.search()['type'];
        if (key) {
            $scope.type = key;
        }

        // selected apis
        $scope.selectedApis = [];

      /*
        var SearchProvider = function (scope, location) {
            var self = this;
            self.scope = scope;
            self.location = location;

            self.callback = function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                self.scope.apis = apisOfType(self.scope.apis, self.scope.type);
                self.scope.type = setSelect(self.scope.type, self.scope.types);

                var q = location.search();
                q['type'] = self.scope.type;
                location.search(q);
                self.evalFilter();
            };

            self.scope.$watch('type', self.callback);

            self.init = function (childScope, grid) {
                self.grid = grid;
                self.childScope = childScope;
                grid.searchProvider = self;
            };

            self.evalFilter = function () {
                var byType = self.grid.sortedData;
                if (self.scope.type !== "") {
                    bType = self.grid.sortedData.findAll(function (item) {
                        return item["type"] === self.scope.type
                    });
                }
                self.grid.filteredData = byType;
                self.grid.rowFactory.filteredDataChanged();
            };
        }

        var searchProvider = new SearchProvider($scope, $location);
      */

        $scope.apiTable = {
            //plugins: [searchProvider],
            data: 'apis',
            showFilter: false,
            showColumnMenu: false,
            filterOptions: {
                useExternalFilter: true
            },
            selectedItems: $scope.selectedApis,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'Id',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/api/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'name',
                    displayName: 'Name',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 350
                },
                {
                    field: 'type',
                    displayName: 'Type',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 100
                }
            ]
        };

        Core.register(jolokia, $scope, {
            type: 'read', mbean: getSelectionJcloudsMBean(workspace)
        }, onSuccess(render));


        function render(response) {
            if (!Object.equal($scope.result, response.value)) {
                $scope.result = response.value;
                $scope.apis = $scope.result["Apis"];
                populateTypeForApis($scope.apis)
                Core.$apply($scope);
            }
        }
    }]);
}
