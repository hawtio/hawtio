module Tomcat {
    export function TomcatController($scope, $location:ng.ILocationService, jolokia) {

        $scope.webAppObjectNames = jolokia.search("*:j2eeType=WebModule,*")

        $scope.webAppName = function webAppName(name) {
            return jolokia.getAttribute(name, "displayName")
        }

        $scope.webAppContextPath = function webAppContextPath(name) {
            return jolokia.getAttribute(name, "path")
        }

        $scope.webAppOperation = function webAppOperation(name,operation) {
            return jolokia.execute(name,operation);
        };

        $scope.wepAppState = function webAppState(name) {
            return jolokia.getAttribute(name, "stateName")
        }

        $scope.isEmpty = function isEmpty(map) {
            return Object.keys(map).length === 0
        }
    }
}