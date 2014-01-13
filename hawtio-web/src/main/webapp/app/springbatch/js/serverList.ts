module SpringBatch {

    export function ServerListController($scope, $location, workspace:Workspace, jolokia, $resource, $rootScope, $http) {

        var serverList = [];
        var serverHref = '';
        for(var server in $rootScope.springBatchServerList){
            serverHref += '#/springbatch/jobs/' ;
            serverHref += getHost($rootScope.springBatchServerList[server])+'/' ;
            serverHref += getPort($rootScope.springBatchServerList[server]) ;
            if(getServerSuffix($rootScope.springBatchServerList[server]).length > 0)
                serverHref += '/'+getServerSuffix($rootScope.springBatchServerList[server]) ;
            serverList.add({
                href: serverHref,
                hostname: getHost($rootScope.springBatchServerList[server]),
                port:getPort($rootScope.springBatchServerList[server])
            });
            serverHref='';
        }
        $scope.serverList = serverList;
    }
}