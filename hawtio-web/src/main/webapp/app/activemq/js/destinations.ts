/// <reference path="activemqPlugin.ts"/>
module ActiveMQ {
    _module.controller("ActiveMQ.QueuesController", ["$scope", "workspace", "jolokia", "localStorage", ($scope, workspace:Workspace, jolokia, localStorage) => {

        var amqJmxDomain = localStorage['activemqJmxDomain'] || "org.apache.activemq";

        $scope.workspace = workspace;

        $scope.destinationType;

        $scope.destinations = [];

        $scope.totalServerItems = 0;

        $scope.pagingOptions = {
            pageSizes: [50, 100, 200],
            pageSize: 100,
            currentPage: 1
        };

        $scope.destinationFilter = {
            name: '',
            filter: '',
            sortColumn: '',
            sortOrder: ''
        };

        $scope.destinationFilterOptions = [
            {id: "noConsumer", name: "No Consumer"}
        ];

        $scope.destinationFilter;

        $scope.sortOptions = {
            fields: ["name"],
            directions: ["asc"]
        };

        var attributes = [];
        if ($scope.destinationType == 'topic') {
            $scope.destinationFilterOptions.push({id: "nonAdvisory", name: "No Advisory Topics"});
            $scope.destinationFilterPlaceholder = "Filter Topic Names...";
            attributes = [
                {
                    field: 'name',
                    displayName: 'Name',
                    width: '20%'
                },
                {
                    field: 'producerCount',
                    displayName: 'Producer Count',
                    width: '10%'
                },
                {
                    field: 'consumerCount',
                    displayName: 'Consumer Count',
                    width: '10%'
                },
                {
                    field: 'enqueueCount',
                    displayName: 'Enqueue Count',
                    width: '10%'
                },
                {
                    field: 'dequeueCount',
                    displayName: 'Dequeue Count',
                    width: '10%'
                },
                {
                    field: 'dispatchCount',
                    displayName: 'Dispatch Count',
                    width: '10%'
                }
            ];
        } else {
            $scope.destinationFilterOptions.push({id: "empty", name: "Only Empty"});
            $scope.destinationFilterOptions.push({id: "nonEmpty", name: "Only Non-Empty"});
            $scope.destinationFilterPlaceholder = "Filter Queue Names...";
            attributes = [
                {
                    field: 'name',
                    displayName: 'Name',
                    width: '20%',
                    cellTemplate: '<div class="ngCellText"><a href="#/activemq/browseQueue?tab=activemq&queueName={{row.entity.name}}">{{row.entity.name}}</a></div>'
                },
                {
                    field: 'queueSize',
                    displayName: 'Queue Size',
                    width: '10%'
                },
                {
                    field: 'producerCount',
                    displayName: 'Producer Count',
                    width: '10%'
                },
                {
                    field: 'consumerCount',
                    displayName: 'Consumer Count',
                    width: '10%'
                },
                {
                    field: 'enqueueCount',
                    displayName: 'Enqueue Count',
                    width: '10%'
                },
                {
                    field: 'dequeueCount',
                    displayName: 'Dequeue Count',
                    width: '10%'
                },
                {
                    field: 'inFlightCount',
                    displayName: 'In-flight Count',
                    width: '10%'
                },
                {
                    field: 'dispatchCount',
                    displayName: 'Dispatch Count',
                    width: '10%'
                },
                {
                    field: 'memoryPercentUsage',
                    displayName: 'Memory Percent Usage [%]',
                    width: '10%'
                },
            ];
        }

        $scope.gridOptions = {
            selectedItems: [],
            data: 'destinations',
            showFooter: true,
            showFilter: true,
            showColumnMenu: true,
            enableCellSelection: false,
            enableColumnResize: true,
            enableColumnReordering: true,
            selectWithCheckboxOnly: false,
            showSelectionCheckbox: false,
            multiSelect: false,
            displaySelectionCheckbox: false, // old pre 2.0 config!
            pagingOptions: $scope.pagingOptions,
            filterOptions: {
                filterText: '',
                useExternalFilter: true
            },
            enablePaging: true,
            totalServerItems: 'totalServerItems',
            maintainColumnRatios: false,
            columnDefs : attributes,
            enableFiltering: true,
            useExternalFiltering: true,
            sortInfo: $scope.sortOptions,
            useExternalSorting: true
        };

        $scope.loadTable = function() {
            $scope.destinationFilter.name = $scope.gridOptions.filterOptions.filterText;
            $scope.destinationFilter.sortColumn = $scope.sortOptions.fields[0];
            $scope.destinationFilter.sortOrder = $scope.sortOptions.directions[0];
            var mbean = getBrokerMBean(workspace, jolokia, amqJmxDomain);
            if (mbean) {
                var method = 'queryQueues(java.lang.String, int, int)';
                if ($scope.destinationType == 'topic') {
                    method = 'queryTopics(java.lang.String, int, int)';
                }
                jolokia.request(
                    {type: 'exec', mbean: mbean, operation: method, arguments: [JSON.stringify($scope.destinationFilter), $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize]},
                    onSuccess(populateTable, {error: onError}));

            }
        };

        function onError() {
            Core.notification("error", "The feature is not available in this broker version!")
            $scope.workspace.selectParentNode();
        }

        function populateTable(response) {
            var data = JSON.parse(response.value);
            $scope.destinations = [];
            angular.forEach(data["data"], (value, idx) => {
                $scope.destinations.push(value);
            });
            $scope.totalServerItems = data["count"];

            Core.$apply($scope);
        }

        $scope.$watch('sortOptions', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.loadTable();
            }
        }, true);

        $scope.$watch('pagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                $scope.loadTable();
            }
        }, true);

    }]);
}
