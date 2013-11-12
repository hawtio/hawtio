module SpringBatch {
    export function ConnectSpringBatchController($scope, $routeParams, $location, workspace:Workspace, $rootScope) {
        console.info('hello connect-----------');

        $scope.host= 'localhost';
        $scope.port= 8080;

        $scope.connectSpringBatch = function(){
            if($scope.selectedSpringBatchServer){
                $rootScope.springBatchServer=$scope.selectedSpringBatchServer;
            }
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