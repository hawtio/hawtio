/**
 * @module Jclouds
 */
/// <reference path="../jcloudsPlugin.ts"/>
module Jclouds {
    _module.controller("Jclouds.ImageListController", ["$scope", "$location", "workspace", "jolokia", "$routeParams", ($scope, $location, workspace, jolokia, $routeParams) => {
        $scope.computeId = $routeParams.computeId;

        $scope.result = {};
        $scope.images = [];

        $scope.operatingSystemFamily = "";
        $scope.operatingSystemFamilies = [];
        var os = $location.search()['os'];
        if (os) {
            $scope.operatingSystemFamily = os;
        }

        // selected images
        $scope.selectedImages = [];

      /*
        var SearchProvider = function (scope, location) {
            var self = this;
            self.scope = scope;
            self.location = location;

            self.callback = function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                self.scope.images = filterImages(self.scope.images, self.scope.operatingSystemFamily);
                self.scope.operatingSystemFamily = setSelect(self.scope.operatingSystemFamily, self.scope.operatingSystemFamilies);

                var q = location.search();
                q['os'] = self.scope.operatingSystemFamily;
                location.search(q);
                self.evalFilter();
            };

            self.scope.$watch('operatingSystemFamily', self.callback);
            self.scope.$watch('location', self.callback);

            self.init = function (childScope, grid) {
                self.grid = grid;
                self.childScope = childScope;
                grid.searchProvider = self;
            };

            self.evalFilter = function () {
                var byOperatingSystemFamily = self.grid.sortedData;
                if (self.scope.operatingSystemFamily !== "") {
                    byOperatingSystemFamily = self.grid.sortedData.findAll(function (item) {
                        return item["operatingSystem"]["family"] === self.scope.operatingSystemFamily
                    });
                }

                self.grid.filteredData = byOperatingSystemFamily;
                self.grid.rowFactory.filteredDataChanged();
            };
        }

        var searchProvider = new SearchProvider($scope, $location);
        */

        $scope.imageTable = {
            //plugins: [searchProvider],
            data: 'images',
            showFilter: false,
            showColumnMenu: false,
            filterOptions: {
                useExternalFilter: true
            },
            selectedItems: $scope.selectedImages,
            rowHeight: 32,
            selectWithCheckboxOnly: true,
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'Id',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/compute/image/{{computeId}}/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
                    width: 200,
                    resizable: false
                },
                {
                    field: 'name',
                    displayName: 'Name',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
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
                    field: 'operatingSystem.is64Bit',
                    displayName: '64 bit',
                    cellTemplate: '<div class="ngCellText pagination-centered"><i class="icon1point5x {{is64BitIcon(row.getProperty(col.field))}}"></i></div>',
                    width: 200
                },
                {
                    field: 'status',
                    displayName: 'Status',
                    cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
                    width: 300
                }
            ]
        };

        Core.register(jolokia, $scope, {
            type: 'exec', mbean: getSelectionJcloudsComputeMBean(workspace, $scope.computeId), operation: 'listImages()'
        }, onSuccess(render));


        function render(response) {
            if (!Object.equal($scope.result, response.value)) {
                $scope.result = response.value;
                $scope.images = $scope.result
                $scope.operatingSystemFamilies = extractOperatingSystemFamilies($scope.images)
                Core.$apply($scope);
            }
        }

        function extractOperatingSystemFamilies(images) {
            var operatingSystemFamilies = [];
            operatingSystemFamilies.push("")
            angular.forEach(images, (image) => {
                var operatingSystemFamily = image["operatingSystem"]["family"];

                operatingSystemFamilies.push(operatingSystemFamily)
            });
            return operatingSystemFamilies.unique();
        }

        $scope.is64BitIcon = (is64bit) => {
            if (is64bit) {
                return 'icon-thumbs-up';
            } else {
                return 'icon-thumbs-down';
            }
        }
    }]);
}
