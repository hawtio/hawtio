module JBoss {
    export function JBossController($scope, $location:ng.ILocationService, jolokia) {

        $scope.webAppObjectNames = jolokia.search("jboss.as:deployment=*")

        $scope.webAppName = function webAppName(name) {
            return jolokia.getAttribute(name, "name")
        }

        $scope.webAppContextPath = function webAppContextPath(name) {
            return jolokia.getAttribute(name, "name")
        }

        $scope.webAppOperation = function webAppOperation(name,operation) {
            return jolokia.execute(name,operation);
        };

        $scope.wepAppState = function webAppState(name) {
            return jolokia.getAttribute(name, "status")
        }

        $scope.isEmpty = function isEmpty(map) {
            return Object.keys(map).length === 0
        }
    }
}