module JBoss {

    export function ConnectorsController($scope, $location, workspace:Workspace, jolokia) {

        $scope.connectors = [];
        $scope.search = "";

        var columnDefs: any[] = [
            {
                field: 'name',
                displayName: 'Name',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'port',
                displayName: 'Port',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'bound',
                displayName: 'Bound',
                cellFilter: null,
                width: "*",
                resizable: true
            }
        ];

        $scope.gridOptions = {
            data: 'connectors',
            displayFooter: true,
            columnDefs: columnDefs,
            filterOptions: {
                filterText: 'search'
            }
        };

        function render(response) {
            $scope.connectors = [];

            function onAttributes(response) {
              var obj = response.value;
              if (obj) {
                obj.mbean = response.request.mbean;
                if (!obj.port) {
                    obj.port = obj.boundPort;
                }
                $scope.connectors.push(obj);
                Core.$apply($scope);
              }
            }

            // create structure for each response
            angular.forEach(response, function(value, key) {
              var mbean = value;
              // management mbean do not have port
              if (mbean.lastIndexOf("management") > 0) {
                jolokia.request( {type: "read", mbean: mbean, attribute: ["boundPort", "name",  "bound"]}, onSuccess(onAttributes));
              } else {
                jolokia.request( {type: "read", mbean: mbean, attribute: ["port", "name",  "bound"]}, onSuccess(onAttributes));
              }
            });
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
          console.log("Loading JBoss connector data...");
          jolokia.search("jboss.as:socket-binding-group=standard-sockets,*", onSuccess(render));
        }

    }
}