module SpringBatch{
    var springBatchServerOrigin = 'localhost:8181/';
    var springBatchServerPath =springBatchServerOrigin+'jobs';
    var proxyUrl = '/hawtio/proxy/';
    var executionsListPath='/executions.json';
    export function SpringBatchJobExecutionListController($scope, $http) {

        $http.get(proxyUrl+springBatchServerPath+executionsListPath,{
            cache:false
        }).success(function(data){
                for(var execution in data.jobExecutions){
                    data.jobExecutions[execution].id=execution;
                }
                console.info(data.jobExecutions)
                $scope.jobExecutions=data.jobExecutions
            }).error(function(data){

            });

    }

}

