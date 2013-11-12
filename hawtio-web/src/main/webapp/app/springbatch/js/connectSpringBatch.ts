module SpringBatch {
    export function ConnectSpringBatchController($scope, $routeParams, $location, workspace:Workspace, $rootScope) {
        console.info('hello connect-----------');

        $scope.host= 'localhost';
        $scope.port= 8080;

        $scope.connectSpringBatch = function(){

            console.info('host-----------'+$scope.host);
            console.info('port-----------'+$scope.port);
            console.info('path-----------'+$scope.path);
            console.info('global -----------'+$rootScope.springBatchServers);
            console.info('selected -----------'+$scope.springBatchServer);
        };

        $scope.addSpringBatchServerToGlobalList = function(){

            console.info('host-----------'+$scope.host);
            console.info('port-----------'+$scope.port);
            console.info('path-----------'+$scope.path);
            console.info('global -----------'+$rootScope.springBatchServers);
            console.info('selected -----------'+$scope.springBatchServer);
        };
    }
}