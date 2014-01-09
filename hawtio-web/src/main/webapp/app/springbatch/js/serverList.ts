module SpringBatch {

    export function ServerListController($scope, $location, workspace:Workspace, jolokia, $resource, $rootScope, $http) {

        $scope.getHost = function(link){
            var endIdx;
            if(link.indexOf('\\')>=0) endIdx = link.indexOf('\\');
            else endIdx = link.indexOf(':');
            return link.substring(0,endIdx);
        };

        $scope.getPort = function(link){
            return link.substring(link.indexOf(':')+1,link.indexOf('/'));
        };
        var serverList = [];

        for(var server in $rootScope.springBatchServerList){
            serverList.add({
                href: '#/springbatch/jobs/'+$scope.getHost($rootScope.springBatchServerList[server])+'/'+$scope.getPort($rootScope.springBatchServerList[server]),
                hostname: $scope.getHost($rootScope.springBatchServerList[server]),
                port:$scope.getPort($rootScope.springBatchServerList[server])
            })
        }
        $scope.serverList = serverList;
    }
}