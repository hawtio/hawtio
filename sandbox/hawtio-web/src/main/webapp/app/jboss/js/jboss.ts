/// <reference path="jbossPlugin.ts"/>
module JBoss {
    _module.controller("JBoss.JBossController", ["$scope", "$location", "jolokia", ($scope, $location:ng.ILocationService, jolokia) => {

        var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | jbossIconClass}}"></i></div>';
        var urlTemplate = '<div class="ngCellText" title="{{row.getProperty(col.field)}}">' +
          '<a ng-href="{{row.getProperty(col.field)}}" target="_blank">{{row.getProperty(col.field)}}</a>' +
          '</div>';

      $scope.uninstallDialog = new UI.Dialog()

        $scope.httpPort;
        $scope.httpScheme = "http";

        $scope.webapps = [];
        $scope.selected = [];

        var columnDefs: any[] = [
            {
                field: 'status',
                displayName: 'State',
                cellTemplate: stateTemplate,
                width: 56,
                minWidth: 56,
                maxWidth: 56,
                resizable: false
            },
            {
                field: 'name',
                displayName: 'Name',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'contextPath',
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
            }
        ];

        $scope.gridOptions = {
            data: 'webapps',
            displayFooter: true,
            selectedItems: $scope.selected,
            selectWithCheckboxOnly: true,
            columnDefs: columnDefs,
            filterOptions: {
              filterText: ''
            }
        };

        function render(response) {
            $scope.webapps = [];
            $scope.mbeanIndex = {};
            $scope.selected.length = 0;

            function onAttributes(response) {
              var obj = response.value;
              if (obj) {
                obj.mbean = response.request.mbean;
                var mbean = obj.mbean;

                if (mbean) {
                  obj.name = JBoss.cleanWebAppName(obj.name);
                  obj.contextPath = JBoss.cleanContextPath(obj.name);

                  // compute the url for the webapp, and we want to use http as scheme
                  var hostname = Core.extractTargetUrl($location, $scope.httpScheme, $scope.httpPort);

                  function updateUrl() {
                    obj.url = hostname + obj['contextPath'];
                  }

                  updateUrl();

                  // lets try find the web contextPath (EAP)
                  var undertowMBean = mbean + ",subsystem=web";
                  jolokia.request( {type: "read", mbean: undertowMBean, attribute: ["contextRoot"]}, onSuccess((response) => {
                    var value = response.value;
                    if (value) {
                      var contextPath = value["contextRoot"];
                      if (contextPath) {
                        obj.contextPath = contextPath;
                        updateUrl();
                        Core.$apply($scope);
                      }
                    }
                  }));

                  // lets try find the undertow contextPath (wildfly)
                  var undertowMBean = mbean + ",subsystem=undertow";
                  jolokia.request( {type: "read", mbean: undertowMBean, attribute: ["contextRoot"]}, onSuccess((response) => {
                    var value = response.value;
                    if (value) {
                      var contextPath = value["contextRoot"];
                      if (contextPath) {
                        obj.contextPath = contextPath;
                        updateUrl();
                        Core.$apply($scope);
                      }
                    }
                  }));

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

            angular.forEach(response, function(value, key) {
                var mbean = value;
                jolokia.request( {type: "read", mbean: mbean, attribute: ["name", "status"]}, onSuccess(onAttributes));
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
        }

        $scope.start = function() {
            $scope.controlWebApps('deploy');
        }

        $scope.stop = function() {
            $scope.controlWebApps('undeploy');
        }

        $scope.reload = function() {
            $scope.controlWebApps('redeploy');
        }

        $scope.uninstall = function() {
            $scope.controlWebApps('remove');
            $scope.uninstallDialog.close();
        }

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
            console.log("Loading JBoss webapp data...");
            // must load connectors first, before showing applications, so we do this call synchronously
            var connectors = jolokia.search("jboss.as:socket-binding-group=standard-sockets,*");
            if (connectors) {
              var found = false;
              angular.forEach(connectors, function (key, value) {
                var mbean = key;
                if (!found) {
                  var data = jolokia.request({type: "read", mbean: mbean, attribute: ["port", "name"]});
                  if (data && data.value && data.value.name && data.value.name.toString().toLowerCase() === 'http') {
                    found = true;
                    $scope.httpPort = data.value.port;
                    $scope.httpScheme = "http";
                  }
                }
              });
            }
            jolokia.search("jboss.as:deployment=*", onSuccess(render));
        }

        // grab server information once
        $scope.jbossServerVersion = "";
        $scope.jbossServerName = "";
        $scope.jbossServerLaunchType = "";

        // lookup jboss 6 and 7
        var servers = jolokia.search("jboss.as:management-root=*")
        if (servers && servers.length === 1) {
            $scope.jbossServerVersion = jolokia.getAttribute(servers[0], "releaseVersion")
            $scope.jbossServerName = jolokia.getAttribute(servers[0], "name")
            $scope.jbossServerLaunchType = jolokia.getAttribute(servers[0], "launchType")
        } else {
            // wildfly is changed
            var wildflyMBean = 'jboss.as:management-root=server';
            var response = jolokia.request( {type: "read", mbean: wildflyMBean, attribute: ["releaseVersion", "name", "launchType"]});
            if (response) {
              var obj = response.value;
              if (obj) {
                $scope.jbossServerVersion = obj.releaseVersion;
                $scope.jbossServerName = obj.name;
                $scope.jbossServerLaunchType = obj.launchType;
              }
            } else {
              console.log("Cannot find JBoss/Wildfly server or there was more than one server")
            }
        }

    }]);
}
