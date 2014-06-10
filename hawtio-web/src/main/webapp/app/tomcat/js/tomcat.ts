module Tomcat {

    export function TomcatController($scope, $location, workspace:Workspace, jolokia) {

        var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | tomcatIconClass}}"></i></div>';
        var urlTemplate = '<div class="ngCellText" title="{{row.getProperty(col.field)}}">' +
          '<a ng-href="{{row.getProperty(col.field)}}" target="_blank">{{row.getProperty(col.field)}}</a>' +
          '</div>';

      $scope.uninstallDialog = new UI.Dialog()

        $scope.httpPort;
        $scope.httpScheme = "http";

        $scope.webapps = [];
        $scope.selected = [];

        var columnDefsTomcat5: any[] = [
            {
                field: 'state',
                displayName: 'State',
                cellTemplate: stateTemplate,
                width: 56,
                minWidth: 56,
                maxWidth: 56,
                resizable: false
            },
            {
                field: 'path',
                displayName: 'Context-Path',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
              field: 'url',
              displayName: 'Url',
              cellTemplate: urlTemplate,
              cellFilter: null,
              width: "*",
              resizable: true
            },
            {
                field: 'startTime',
                displayName: 'Start Time',
                cellFilter: null,
                width: "*",
                resizable: true
            }
        ];

        var columnDefsTomcat6: any[] = [
            {
                field: 'stateName',
                displayName: 'State',
                cellTemplate: stateTemplate,
                width: 56,
                minWidth: 56,
                maxWidth: 56,
                resizable: false
            },
            {
                field: 'path',
                displayName: 'Context-Path',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
              field: 'url',
              displayName: 'Url',
              cellTemplate: urlTemplate,
              cellFilter: null,
              width: "*",
              resizable: true
            },
            {
                field: 'startTime',
                displayName: 'Start Time',
                cellFilter: null,
                width: "*",
                resizable: true
            }
        ];

        var columnDefsTomcat7: any[] = [
            {
                field: 'stateName',
                displayName: 'State',
                cellTemplate: stateTemplate,
                width: 56,
                minWidth: 56,
                maxWidth: 56,
                resizable: false
            },
            {
                field: 'path',
                displayName: 'Context-Path',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
              field: 'displayName',
              displayName: 'Display Name',
              cellFilter: null,
              width: "*",
              resizable: true
            },
            {
              field: 'url',
              displayName: 'Url',
              cellTemplate: urlTemplate,
              cellFilter: null,
              width: "*",
              resizable: true
            },
            {
                field: 'startTime',
                displayName: 'Start Time',
                cellFilter: null,
                width: "*",
                resizable: true
            }
        ];

        $scope.gridOptions = {
            data: 'webapps',
            displayFooter: true,
            selectedItems: $scope.selected,
            selectWithCheckboxOnly: true,
            filterOptions: {
              filterText: ''
            }
        };

/*        function extractHttpPort(response) {
          var obj = response;
          if (obj) {
            angular.forEach(obj, function (key, value) {
              var mbean = key;
              jolokia.request({type: "read", mbean: mbean, attribute: ["port", "scheme", "protocol"]}, onSuccess(onHttpPort));
            });
          }
        }

        function onHttpPort(response) {
          // we only need the HTTP protocol
          var obj = response.value;
          if (obj && obj.protocol && obj.protocol.toString().startsWith("HTTP")) {
            $scope.httpPort = obj.port;
            $scope.httpScheme = obj.scheme;
          }
        }
*/
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

              // compute the url for the webapp, and we want to use http as scheme
              var hostname = Core.extractTargetUrl($location, $scope.httpScheme, $scope.httpPort);
              obj.url = hostname + obj['path'];

              if (mbean) {

                // format the start time as readable date format
                obj.startTime = millisToDateFormat(obj.startTime);

                var idx = $scope.mbeanIndex[mbean];
                if (angular.isDefined(idx)) {
                  $scope.webapps[mbean] = obj;
                } else {
                  $scope.mbeanIndex[mbean] = $scope.webapps.length;
                  $scope.webapps.push(obj);
                }

                // ensure web page is updated
                Core.$apply($scope);
              }
            }
          }

          angular.forEach(response, function (value, key) {
            var mbean = value;
            if (isTomcat5($scope.tomcatServerVersion)) {
              jolokia.request({type: "read", mbean: mbean,
                attribute: ["path", "state", "startTime"]}, onSuccess(onAttributes));
            } else if (isTomcat6($scope.tomcatServerVersion)) {
              jolokia.request({type: "read", mbean: mbean,
                attribute: ["path", "stateName", "startTime"]}, onSuccess(onAttributes));
            } else {
              jolokia.request({type: "read", mbean: mbean,
                attribute: ["displayName", "path", "stateName", "startTime"]}, onSuccess(onAttributes));
            }
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
            $scope.uninstallDialog.close();
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

      $scope.$on('jmxTreeUpdated', reloadFunction);
      $scope.$watch('workspace.tree', reloadFunction);

    function reloadFunction() {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    }

        function loadData() {
          console.log("Loading tomcat webapp data...");
          // must load connectors first, before showing applications, so we do this call synchronously
          var connectors = jolokia.search("*:type=Connector,*");
          if (connectors) {
            var found = false;
            angular.forEach(connectors, function (key, value) {
              var mbean = key;
              if (!found) {
                var data = jolokia.request({type: "read", mbean: mbean, attribute: ["port", "scheme", "protocol"]});
                if (data && data.value) {
                  function isHttp(value) {
                    return value && value.toString().startsWith("http");
                  }

                  if (isHttp(data.value.protocol) || isHttp(data.value.scheme)) {
                    found = true;
                    $scope.httpPort = data.value.port;
                    $scope.httpScheme = data.value.scheme;
                  }
                }
              }
            });
          }
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

        // the columns shown in the applications view depends on the Tomcat version in use
        if (isTomcat5($scope.tomcatServerVersion)) {
          console.log("Using Tomcat 5")
          $scope.gridOptions.columnDefs = columnDefsTomcat5;
        } else if (isTomcat6($scope.tomcatServerVersion)) {
          console.log("Using Tomcat 6")
          $scope.gridOptions.columnDefs = columnDefsTomcat6;
        } else {
          console.log("Using Tomcat 7")
          $scope.gridOptions.columnDefs = columnDefsTomcat7;
        }

    }
}
