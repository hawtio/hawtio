module Camel {

    export function ProfileRouteController($scope, $location, workspace:Workspace, jolokia) {

        $scope.data = [];
        $scope.search = "";

      var columnDefs: any[] = [
            {
                field: 'id',
                displayName: 'Id',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'count',
                displayName: 'Count',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'last',
                displayName: 'Last',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'delta',
                displayName: 'Delta',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'mean',
                displayName: 'Mean',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'min',
                displayName: 'Min',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'max',
                displayName: 'Max',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'total',
                displayName: 'Total',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'self',
                displayName: 'Self',
                cellFilter: null,
                width: "*",
                resizable: true
            }
        ];

        $scope.gridOptions = {
            data: 'data',
            displayFooter: true,
            displaySelectionCheckbox: false,
            canSelectRows: false,
            enableSorting: false,
            columnDefs: columnDefs,
            filterOptions: {
                filterText: 'search'
            }
        };


      var populateProfileMessages = function (response) {
        var updatedData = [];

        // its xml structure so we need to parse it
        var xml = response.value;
        if (angular.isString(xml)) {

          // lets parse the XML DOM here...
          var doc = $.parseXML(xml);

          var routeMessages = $(doc).find("routeStat");

          routeMessages.each((idx, message) => {
            var messageData = {
              id: {},
              count: {},
              last: {},
              delta: {},
              mean: {},
              min: {},
              max: {},
              total: {},
              self: {}
            };

            // compare counters, as we only update if we have new data
            messageData.id = message.getAttribute("id");

            var total = 0;
            total += +message.getAttribute("exchangesCompleted");
            total += +message.getAttribute("exchangesFailed");
            messageData.count = total;
            messageData.last = message.getAttribute("lastProcessingTime");
            // delta is only avail from Camel 2.11 onwards
            var delta = message.getAttribute("deltaProcessingTime");
            if (delta) {
              messageData.delta = delta;
            } else {
              messageData.delta = 0;
            }
            messageData.mean = message.getAttribute("meanProcessingTime");
            messageData.min = message.getAttribute("minProcessingTime");
            messageData.max = message.getAttribute("maxProcessingTime");
            messageData.total = message.getAttribute("totalProcessingTime");
            // self is pre calculated from Camel 2.11 onwards
            var self = message.getAttribute("selfProcessingTime");
            if (self) {
              messageData.self = self;
            } else {
              messageData.self = "TODO";
            }

            updatedData.push(messageData);
          });

          console.log("Updating processor stats...");
          var processorMessages = $(doc).find("processorStat");

          processorMessages.each((idx, message) => {
            var messageData = {
              id: {},
              count: {},
              last: {},
              delta: {},
              mean: {},
              min: {},
              max: {},
              total: {},
              self: {}
            };

            messageData.id = message.getAttribute("id");
            var total = 0;
            total += +message.getAttribute("exchangesCompleted");
            total += +message.getAttribute("exchangesFailed");
            messageData.count = total;
            messageData.last = message.getAttribute("lastProcessingTime");
            // delta is only avail from Camel 2.11 onwards
            var delta = message.getAttribute("deltaProcessingTime");
            if (delta) {
              messageData.delta = delta;
            } else {
              messageData.delta = 0;
            }
            messageData.mean = message.getAttribute("meanProcessingTime");
            messageData.min = message.getAttribute("minProcessingTime");
            messageData.max = message.getAttribute("maxProcessingTime");
            // total time for processors is pre calculated as accumulated from Camel 2.11 onwards
            var total = message.getAttribute("accumulatedProcessingTime");
            if (total) {
              messageData.total = total;
            } else {
              messageData.total = "TOOD"
            }
            // self time for processors is their total time
            messageData.self = message.getAttribute("totalProcessingTime");

            updatedData.push(messageData);
          });
        }

        // replace data with updated data
        $scope.data = updatedData;
        Core.$apply($scope);
      };

        // function to trigger reloading page
        $scope.onResponse = function (response) {
          //console.log("got response: " + response);
          loadData();
        };

        $scope.$watch('workspace.tree', function () {
          // if the JMX tree is reloaded its probably because a new MBean has been added or removed
          // so lets reload, asynchronously just in case
          setTimeout(loadData, 50);
        });

        function loadData() {
          console.log("Loading Camel route profile data...");
          var selectedRouteId = getSelectedRouteId(workspace);
          var routeMBean = getSelectionRouteMBean(workspace, selectedRouteId);
          console.log("Selected route is " + selectedRouteId)

          // schedule update the profile data, based on the configured interval
          // TODO: trigger loading data first time page is viewed so we dont have to wait or show a loading... page
          // TODO: show eips in the table/tree
          // TODO: have cellFilter with bar grey-scale for highlighting the scales between the numbers

          var query = {type: 'exec', mbean: routeMBean, operation: 'dumpRouteStatsAsXml(boolean,boolean)', arguments: [false, true]};
          scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(populateProfileMessages, query));
       }

    }
}