module SpringBatch{
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';
    var springBatchServerPath =springBatchServerOrigin+'jobs';
    var proxyUrl = '/hawtio/proxy/';
    var executionsListPath='/executions.json';
    export function SpringBatchJobExecutionListController($scope, $resource) {

        $scope.predicate = 'name';
        $scope.reverse = false;

        var executionListRes = $resource(proxyUrl+springBatchServerPath+executionsListPath);
        executionListRes.get(function(data){
            var executionList = new Array();
            for(var execution in data.jobExecutions){
                data.jobExecutions[execution].id=execution;
                executionList.add(data.jobExecutions[execution]);
            }
            $scope.jobExecutions = executionList;
        });
    }

}

