module JBoss {
    export function JBossController($scope, $location:ng.ILocationService, jolokia) {

        $scope.webAppObjectNames = jolokia.search("jboss.as:deployment=*")

        $scope.webAppName = function webAppName(name) {
            var name = jolokia.getAttribute(name, "name")
            // TODO: a better way to drop .war from the name
            return name.substring(0, name.length - 4)
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