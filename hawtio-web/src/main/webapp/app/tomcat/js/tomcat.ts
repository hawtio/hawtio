module Tomcat {

    export function TomcatController($scope, $location, workspace:Workspace) {

        $scope.webapps = [];

        var columnDefs: any[] = [
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
                field: 'state',
                displayName: 'State',
                cellFilter: null,
                width: "*",
                resizable: false
            }
        ];

        $scope.gridOptions = {
            data: 'webapps',
            displayFooter: false,
            columnDefs: columnDefs
        };

        var updateValues = function (response) {
            console.log("Update values with response " + response);

            $scope.webapps = [];
            angular.forEach(response, function(value, key) {
                console.log("Got mbean name " + value);
                var obj = {
                    name: jolokia.getAttribute(value, "displayName"),
                    contextPath: jolokia.getAttribute(value, "path"),
                    state: jolokia.getAttribute(value, "stateName")
                };
                $scope.webapps.push(obj);
            });
            $scope.$apply();
        };

        var jolokia = workspace.jolokia;
        jolokia.search("*:j2eeType=WebModule,*", onSuccess(updateValues));

/*
        // listen for updates adding the since
        var asyncUpdateValues = function (response) {
            var value = response.value;
            if (value) {
                updateValues(value);
            } else {
                notification("error", "Failed to get a response! " + JSON.stringify(response, null, 4));
            }
        };

        var callback = onSuccess(asyncUpdateValues,
            {
                error: (response) => {
                    asyncUpdateValues(response);
                }
            });

        scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(callback, $scope.queryJSON));
*/

//        $scope.webAppObjectNames = jolokia.search("*:j2eeType=WebModule,*")

//        $scope.webAppName = function webAppName(name) {
//            return jolokia.getAttribute(name, "displayName")
//        }

//        $scope.webAppContextPath = function webAppContextPath(name) {
//            return jolokia.getAttribute(name, "path")
//        }

//        $scope.webAppOperation = function webAppOperation(name,operation) {
//            return jolokia.execute(name,operation);
//        };

//        $scope.wepAppState = function webAppState(name) {
//            return jolokia.getAttribute(name, "stateName")
//        }

//        $scope.isEmpty = function isEmpty(map) {
//            return Object.keys(map).length === 0
//        }
    }
}