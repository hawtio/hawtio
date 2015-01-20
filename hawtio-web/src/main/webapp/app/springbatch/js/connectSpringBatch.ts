/// <reference path="./springbatchPlugin.ts"/>
module SpringBatch {
    _module.controller("SpringBatch.ConnectSpringBatchController", ["$scope", "$routeParams", "$location", "workspace", "$rootScope", "$resource", "$http", ($scope, $routeParams, $location, workspace:Workspace, $rootScope, $resource, $http) => {

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
            var server = getServerUrl($scope.host, $scope.port, $scope.path);
            if($rootScope.springBatchServerList.indexOf($scope.selectedSpringBatchServer) > 0){
                $rootScope.alert.content='Server already in the list.';
                $rootScope.alert.type = 'alert-error';
                $rootScope.alert.show();
                return;
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
        };

        $scope.editServer = function(){
            $scope.host = getHost($scope.selectedSpringBatchServer);
            $scope.port = parseInt(getPort($scope.selectedSpringBatchServer));
            $scope.path = getServerSuffix($scope.selectedSpringBatchServer);
        };

        $scope.updateServer = function(){
            var server = getServerUrl($scope.host, $scope.port, $scope.path);
            var replaceServer = $scope.selectedSpringBatchServer;
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http.post('/hawtio/springBatch','server='+server+'&replaceServer='+replaceServer).success(function(data){
                $rootScope.springBatchServerList[$rootScope.springBatchServerList.indexOf($scope.selectedSpringBatchServer)] = server;
                $rootScope.alert.content='Server updated.';
                $rootScope.alert.type = 'alert-success';
                $rootScope.alert.show();
            }).error(function(data){
                    $rootScope.alert.content='Could not add server.';
                    $rootScope.alert.type = 'alert-error';
                    $rootScope.alert.show();
                });

        }
    }]);
}
