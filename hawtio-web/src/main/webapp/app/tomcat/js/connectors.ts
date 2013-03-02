module Tomcat {

    export function ConnectorsController($scope, $location, workspace:Workspace, jolokia) {

        $scope.connectors = [];
        $scope.selected = [];
        $scope.search = "";

        var columnDefs: any[] = [
            {
                field: 'port',
                displayName: 'Port',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'scheme',
                displayName: 'Scheme',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'protocol',
                displayName: 'Protocol',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'secure',
                displayName: 'Secure',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'connectionLinger',
                displayName: 'Connection Linger',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'connectionTimeout',
                displayName: 'Connection Timeout',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'keepAliveTimeout',
                displayName: 'Keep Alive Timeout',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'minSpareThreads',
                displayName: 'Minimum Threads',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'maxThreads',
                displayName: 'Maximum Threads',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'stateName',
                displayName: 'State',
                cellFilter: null,
                width: "*",
                resizable: true
            }
        ];

        $scope.gridOptions = {
            data: 'connectors',
            displayFooter: false,
            selectedItems: $scope.selected,
            selectWithCheckboxOnly: true,
            columnDefs: columnDefs,
            filterOptions: {
                filterText: 'search'
            }
        };

        function render(response) {
            $scope.connectors = [];
            $scope.selected.length = 0;

            function onAttributes(response) {
              var obj = response.value;
              if (obj) {
                obj.mbean = response.request.mbean;
                $scope.connectors.push(obj);
                Core.$apply($scope);
              }
            }

            // create structure for each response
            angular.forEach(response, function(value, key) {
              var mbean = value;
              jolokia.request( {type: "read", mbean: mbean, attribute: ["scheme", "port", "protocol", "secure",
                  "connectionLinger", "connectionTimeout", "keepAliveTimeout", "minSpareThreads", "maxThreads", "stateName"]}, onSuccess(onAttributes));
            });
          Core.$apply($scope);
        };

        // function to control the web applications
        $scope.controlConnector = function(op) {
            // grab id of mbean names to control
            var ids = $scope.selected.map(function(b) { return b.mbean });
            if (!angular.isArray(ids)) {
                ids = [ids];
            }

            // execute operation on each mbean
            ids.forEach((id) => {
                jolokia.request({
                        type: 'exec',
                        mbean: id,
                        operation: op,
                        arguments: null
                    },
                    onSuccess($scope.onResponse, {error: $scope.onResponse}));
            });
        };

        $scope.stop = function() {
            $scope.controlConnector('stop');
        };

        $scope.start = function() {
            $scope.controlConnector('start');
        };

        $scope.destroy = function() {
            $scope.controlConnector('destroy');
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
          console.log("Loading tomcat connector data...");
          jolokia.search("Catalina:type=Connector,*", onSuccess(render));
        }

    }
}