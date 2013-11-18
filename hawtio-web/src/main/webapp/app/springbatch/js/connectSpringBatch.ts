module SpringBatch {
    export function ConnectSpringBatchController($scope, $routeParams, $location, workspace:Workspace, $rootScope, $resource, $http) {
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

            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http.post('/hawtio/springBatch','server='+server).success(function(data){
                $rootScope.springBatchServerList.add(server);
            });
        };

        $scope.removeServer = function (index){
            console.info('removing : '+$scope.selectedSpringBatchServer);
            console.info('removing : '+$scope.springBatchServerList.indexOf($scope.selectedSpringBatchServer));
            $http.delete('/hawtio/springBatch?server='+encodeURIComponent($scope.selectedSpringBatchServer)).success(function(data){
                $scope.springBatchServerList.splice($scope.springBatchServerList.indexOf($scope.selectedSpringBatchServer),1);
            });
        }
    }
}