module Tomcat {
    export function TomcatController($scope, $location:ng.ILocationService, jolokia) {

        $scope.webAppObjectNames = jolokia.search("Tomcat:j2eeType=WebModule,*");

        $scope.webAppName = function webAppName(name) {
            console.log("get attr displayName on mbean " + name);
            return jolokia.getAttribute(name, "displayName")
        }

        $scope.webAppContextPath = function webAppContextPath(name) {
            console.log("get attr path on mbean " + name);
            return jolokia.getAttribute(name, "path")
        }

        $scope.webAppOperation = function webAppOperation(name,operation) {
            console.log("Executing " + operation + " on mbean " + name);
            return jolokia.execute(name,operation);
        };

        $scope.wepAppState = function webAppState(name) {
            console.log("get attr stateName on mbean " + name);
            return jolokia.getAttribute(name, "stateName");
        }

        $scope.isEmpty = function isEmpty(map) {
            return Object.keys(map).length === 0;
        }
    }
}