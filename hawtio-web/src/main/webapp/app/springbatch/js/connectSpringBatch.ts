module SpringBatch {
    export function ConnectSpringBatchController($scope, $routeParams, $location, workspace:Workspace, $rootScope, $resource, $http) {

        $scope.host= 'localhost';
        $scope.port= 8080;

        $scope.connectSpringBatch = function(){
            if($scope.selectedSpringBatchServer){
                $rootScope.springBatchServer=$scope.selectedSpringBatchServer;
                $rootScope.alert.content='Connected successfully.';
                $rootScope.alert.type = 'alert-success';
                $rootScope.alert.show();
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
                $rootScope.springBatchServer=$scope.selectedSpringBatchServer;
                $rootScope.alert.content='Server added.';
                $rootScope.alert.type = 'alert-success';
                $rootScope.alert.show();
            }).error(function(data){
                    $rootScope.alert.content='Could not add server.';
                    $rootScope.alert.type = 'alert-error';
                    $rootScope.alert.show();
                });
        };

        $scope.removeServer = function (index){
            $http.delete('/hawtio/springBatch?server='+encodeURIComponent($scope.selectedSpringBatchServer)).success(function(data){
                $scope.springBatchServerList.splice($scope.springBatchServerList.indexOf($scope.selectedSpringBatchServer),1);
                $rootScope.alert.content='Server deleted.';
                $rootScope.alert.type = 'alert-info';
                $rootScope.alert.show();
            }).error(function(data){
                    $rootScope.alert.content='Could not delete server.';
                    $rootScope.alert.type = 'alert-error';
                    $rootScope.alert.show();
                });
        }
    }
}