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
            var server = '';
            server = $scope.host+'\\:'+$scope.port;
            if($scope.path){
                if($scope.path.charAt(0) != '/')
                    server=server+'/'+$scope.path;
                else
                    server=server+$scope.path;
            }
            if(server.charAt(server.length-1) != '/'){
                server=server+'/'
            }
            $rootScope.springBatchServers.add(server);
        };
    }
}