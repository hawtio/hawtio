module SpringBatch {
    export function ConnectSpringBatchController($scope, $routeParams, $location, workspace:Workspace) {
        console.info('hello connect-----------');

        $scope.host= 'localhost';
        $scope.port= 8080;
        $scope.connectSpringBatch = function(){
            console.info('host-----------'+$scope.host);
            console.info('port-----------'+$scope.port);
            console.info('path-----------'+$scope.path);
        };
    }
}