/// <reference path="camelPlugin.ts"/>
module Camel {

    _module.controller("Camel.ProfileRouteController", ["$scope", "$location", "workspace", "jolokia","localStorage", ($scope, $location, workspace:Workspace, jolokia, localStorage) => {
        var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

        $scope.workspace = workspace;
        $scope.data = [];
        $scope.icons = {};
        $scope.selectedRouteId = "";

        var columnDefs: any[] = [
            {
                field: 'id',
                displayName: 'Id',
                cellTemplate: '<div class="ngCellText" ng-bind-html-unsafe="rowIcon(row.entity.id)"></div>',
                cellFilter: null,
                width: "**",
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

        $scope.rowIcon = (id) => {
          var entry = $scope.icons[id];
          if (entry) {
            return entry.img + " " + id;
          } else {
            return id;
          }
        }

        $scope.gridOptions = {
            data: 'data',
            displayFooter: true,
            displaySelectionCheckbox: false,
            canSelectRows: false,
            enableSorting: false,
            columnDefs: columnDefs,
            filterOptions: {
              filterText: ''
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
            messageData.self = message.getAttribute("selfProcessingTime");

            updatedData.push(messageData);
          });

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
            var apt = message.getAttribute("accumulatedProcessingTime");
            if (apt) {
              messageData.total = apt;
            } else {
              messageData.total = "0"
            }
            // self time for processors is their total time
            messageData.self = message.getAttribute("totalProcessingTime");

            updatedData.push(messageData);
          });
        }

        // if we do as below with the forEach then the data does not update
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

        function initIdToIcon() {
          console.log("initializing id and icons")

          $scope.icons = {};
          var routeXml = Core.pathGet(workspace.selection, ["routeXmlNode"]);
          if (routeXml) {

            // add route id first
            var entry = {
              img : "",
              index : 0
            };
            entry.index = -1;
            entry.img = "<img src='img/icons/camel/camel_route.png'>";
            $scope.icons[$scope.selectedRouteId] = entry;

            // then each processor id and icons
            $(routeXml).find('*').each((idx, element) => {
              var id = element.getAttribute("id");
              if (id) {
                var entry = {
                  img : "",
                  index : 0
                };
                entry.index = idx;
                var icon = Camel.getRouteNodeIcon(element);
                if (icon) {
                  entry.img = "<img src='" + icon + "'>";
                } else {
                  entry.img = "";
                }
                $scope.icons[id] = entry;
              }
            });
          }
        }

        function loadData() {
          console.log("Loading Camel route profile data...");
          $scope.selectedRouteId = getSelectedRouteId(workspace);
          var routeMBean = getSelectionRouteMBean(workspace, $scope.selectedRouteId, camelJmxDomain);
          console.log("Selected route is " + $scope.selectedRouteId)

          initIdToIcon();
          console.log("Initialized icons, with " + $scope.icons.length + " icons")

          // schedule update the profile data, based on the configured interval

          var query = {type: 'exec', mbean: routeMBean, operation: 'dumpRouteStatsAsXml(boolean,boolean)', arguments: [false, true]};
          scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(populateProfileMessages, query));
       }

    }]);
}
