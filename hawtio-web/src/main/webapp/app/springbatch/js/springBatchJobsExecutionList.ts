module SpringBatch{
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';
    var springBatchServerPath =springBatchServerOrigin+'jobs';
    var proxyUrl = '/hawtio/proxy/';
    var executionsListPath='/executions.json';
    export function SpringBatchJobExecutionListController($scope, $http, $resource) {

        var executionListRes = $resource(proxyUrl+springBatchServerPath+executionsListPath);
        executionListRes.get(function(data){
            for(var execution in data.jobExecutions){
                data.jobExecutions[execution].id=execution;
            }
            $scope.jobExecutions=data.jobExecutions
        });
    }

}

