/// <reference path="./tomcatPlugin.ts"/>
module Tomcat {

    _module.controller("Tomcat.SessionsController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace:Workspace, jolokia) => {

        var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | tomcatIconClass}}"></i></div>';

        $scope.sessions = [];
        $scope.search = "";

        var columnDefs: any[] = [
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
                field: 'activeSessions',
                displayName: 'Active Sessions',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'expiredSessions',
                displayName: 'Expired Sessions',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'rejectedSessions',
                displayName: 'Rejected Sessions',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'maxActive',
                displayName: 'Max Active Sessions',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'maxActiveSessions',
                displayName: 'Max Active Sessions Allowed',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'maxInactiveInterval',
                displayName: 'Max Inactive Interval',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'sessionCounter',
                displayName: 'Session Counter',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'sessionCreateRate',
                displayName: 'Session Create Rate',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'sessionExpireRate',
                displayName: 'Session Expire Rate',
                cellFilter: null,
                width: "*",
                resizable: true
            }
        ];

        $scope.gridOptions = {
            data: 'sessions',
            displayFooter: false,
            displaySelectionCheckbox: false,
            canSelectRows: false,
            columnDefs: columnDefs,
            filterOptions: {
              filterText: ''
            }
        };

        function render(response) {
          response = Tomcat.filerTomcatOrCatalina(response);

          $scope.sessions = [];

          function onAttributes(response) {
            var obj = response.value;
            if (obj) {
              obj.mbean = response.request.mbean;
              var mbean = obj.mbean;
              if (mbean) {

                // the context path is part of the mbean name
                // grab the 2nd part of the mbean that has context=/name
                var context = mbean.toString().split(",")[1];
                if (context) {
                  if (context.toString().indexOf("path=") !== -1) {
                    // and remove the leading path=/ from the name (Tomcat 5 or 6)
                    obj.path = context.toString().substr(5)
                  } else {
                    // and remove the leading context=/ from the name (Tomcat 7)
                    obj.path = context.toString().substr(9)
                  }
                } else {
                  obj.path = "";
                }

                $scope.sessions.push(obj);
                Core.$apply($scope);
              }
            }
          }

          angular.forEach(response, function (value, key) {
            var mbean = value;
            jolokia.request({type: "read", mbean: mbean}, onSuccess(onAttributes));
          });
          Core.$apply($scope);
        };

      $scope.$on('jmxTreeUpdated', reloadFunction);
      $scope.$watch('workspace.tree', reloadFunction);

      function reloadFunction() {
        // if the JMX tree is reloaded its probably because a new MBean has been added or removed
        // so lets reload, asynchronously just in case
        setTimeout(loadData, 50);
      }

        function loadData() {
          console.log("Loading tomcat session data...");
          jolokia.search("*:type=Manager,*", onSuccess(render));
        }
    }]);
}
