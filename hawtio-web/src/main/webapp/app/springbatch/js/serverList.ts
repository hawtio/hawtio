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

        $scope.getServerPrefix = function(link){
             if(link.indexOf('/') != link.lastIndexOf('/'))
                 return link.substring(link.indexOf('/')+1,link.lastIndexOf('/'));
            else return '';
        };

        var serverList = [];
        var serverHref = '';
        for(var server in $rootScope.springBatchServerList){
            serverHref += '#/springbatch/jobs/' ;
            serverHref += $scope.getHost($rootScope.springBatchServerList[server])+'/' ;
            serverHref += $scope.getPort($rootScope.springBatchServerList[server]) ;
            if($scope.getServerPrefix($rootScope.springBatchServerList[server]).length > 0)
                serverHref += '/'+$scope.getServerPrefix($rootScope.springBatchServerList[server]) ;
            serverList.add({
                href: serverHref,
                hostname: $scope.getHost($rootScope.springBatchServerList[server]),
                port:$scope.getPort($rootScope.springBatchServerList[server])
            });
            serverHref='';
        }
        $scope.serverList = serverList;
    }
}