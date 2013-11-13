module SpringBatch{

    export function SpringBatchJobExecutionListController($scope, $resource, $rootScope) {
        var springBatchServerOrigin = $rootScope.springBatchServer;
        var springBatchServerPath = springBatchServerOrigin+'jobs';
        var proxyUrl = $rootScope.proxyUrl;
        var executionsListPath='/executions.json';

        var executionListRes = $resource(proxyUrl+springBatchServerPath+executionsListPath);
        executionListRes.get(function(data){
            for(var execution in data.jobExecutions){
                data.jobExecutions[execution].id=execution;
            }
            $scope.jobExecutions=data.jobExecutions
        });
    }

}