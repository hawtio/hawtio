module Tomcat {

    export function TomcatController($scope, $location, workspace:Workspace, jolokia) {

        $scope.webapps = [];
        $scope.selected = [];
        $scope.search = "";

        var columnDefs: any[] = [
            {
                field: 'displayName',
                displayName: 'Name',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'path',
                displayName: 'Context-Path',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'stateName',
                displayName: 'State',
                cellFilter: null,
                width: "*",
                resizable: false
            }
        ];

        $scope.gridOptions = {
            data: 'webapps',
            displayFooter: true,
            selectedItems: $scope.selected,
            selectWithCheckboxOnly: true,
            columnDefs: columnDefs,
            filterOptions: {
                filterText: 'search'
            }
        };

        function render(response) {
          response = Tomcat.filerTomcatOrCatalina(response);

          $scope.webapps = [];
          $scope.mbeanIndex = {};
          $scope.selected.length = 0;

          function onAttributes(response) {
            var obj = response.value;
            if (obj) {
              obj.mbean = response.request.mbean;
              var mbean = obj.mbean;
              if (mbean) {
                var idx = $scope.mbeanIndex[mbean];
                if (angular.isDefined(idx)) {
                  $scope.webapps[mbean] = obj;
                } else {
                  $scope.mbeanIndex[mbean] = $scope.webapps.length;
                  $scope.webapps.push(obj);
                }
                Core.$apply($scope);
              }
            }
          }

          angular.forEach(response, function (value, key) {
            var mbean = value;
            jolokia.request({type: "read", mbean: mbean, attribute: ["displayName", "path", "stateName"]}, onSuccess(onAttributes));
          });
          Core.$apply($scope);
        };

        // function to control the web applications
        $scope.controlWebApps = function(op) {
            // grab id of mbean names to control
            var mbeanNames = $scope.selected.map(function(b) { return b.mbean });
            if (!angular.isArray(mbeanNames)) {
                mbeanNames = [mbeanNames];
            }

            // execute operation on each mbean
            var lastIndex = (mbeanNames.length || 1) - 1;
            angular.forEach(mbeanNames, (mbean, idx) => {
              var onResponse = (idx >= lastIndex) ? $scope.onLastResponse : $scope.onResponse;
              jolokia.request({
                        type: 'exec',
                        mbean: mbean,
                        operation: op,
                        arguments: null
                    },
                    onSuccess(onResponse, {error: onResponse}));
            });
        };

        $scope.stop = function() {
            $scope.controlWebApps('stop');
        };

        $scope.start = function() {
            $scope.controlWebApps('start');
        };

        $scope.reload = function() {
            $scope.controlWebApps('reload');
        };

        $scope.uninstall = function() {
            $scope.controlWebApps('destroy');
        };

        // function to trigger reloading page
        $scope.onLastResponse = function (response) {
          $scope.onResponse(response);
          // we only want to force updating the data on the last response
          loadData();
        };

        $scope.onResponse = function (response) {
          //console.log("got response: " + response);
        };

        $scope.$watch('workspace.tree', function () {
          // if the JMX tree is reloaded its probably because a new MBean has been added or removed
          // so lets reload, asynchronously just in case
          setTimeout(loadData, 50);
        });

        function loadData() {
          console.log("Loading tomcat webapp data...");
          jolokia.search("*:j2eeType=WebModule,*", onSuccess(render));
        }

        // grab server information once
        $scope.tomcatServerVersion = "";

        var servers = jolokia.search("*:type=Server");
        servers = Tomcat.filerTomcatOrCatalina(servers);
        if (servers && servers.length === 1) {
            $scope.tomcatServerVersion = jolokia.getAttribute(servers[0], "serverInfo")
        } else {
            console.log("Cannot find Tomcat server or there was more than one server. response is: " + servers)
        }

    }
}