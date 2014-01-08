module SpringBatch {

    export function ServerListController($scope, $location, workspace:Workspace, jolokia, $resource, $rootScope, $http) {
        console.info('----------------------- ServerListController ------------ ');
        var serverList = [];
        for(var server in $rootScope.springBatchServerList){
            console.info(' -------------- server --------- '+ $rootScope.springBatchServerList[server]);

            var hostname = '';
            var port = '';

            serverList.add({
                href:$rootScope.springBatchServerList[server],
                hostname:'',
                port:''
            })
        }
    }
}