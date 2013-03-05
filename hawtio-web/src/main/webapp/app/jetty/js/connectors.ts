module Jetty {

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
                field: 'running',
                displayName: 'Running',
                cellFilter: null,
                width: "*",
                resizable: true
            }
        ];

        $scope.gridOptions = {
            data: 'connectors',
            displayFooter: true,
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
                // split each into 2 rows as we want http and https on each row
                obj.mbean = response.request.mbean;
                obj.scheme = "http";
                obj.port = obj.port;
                $scope.connectors.push(obj);
                if (obj.confidentialPort) {
                  // create a clone of obj for https
                  var copyObj = {
                    scheme: "https",
                    port: obj.confidentialPort,
                    running: obj.running,
                    mbean: obj.mbean
                  }
                  $scope.connectors.push(copyObj);
                }
                Core.$apply($scope);
              }
            }

            // create structure for each response
            angular.forEach(response, function(value, key) {
              var mbean = value;
              jolokia.request( {type: "read", mbean: mbean, attribute: ["confidentialPort", "confidentialScheme", "port", "running"]}, onSuccess(onAttributes));
            });
          Core.$apply($scope);
        };

        // function to control the connectors
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
          console.log("Loading Jetty connector data...");
          jolokia.search("org.eclipse.jetty.server.nio:type=selectchannelconnector,*", onSuccess(render));
        }

    }
}