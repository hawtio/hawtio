module SpringBatch{
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';
    var springBatchServerPath =springBatchServerOrigin+'jobs/executions/:jobExecutionId/';

    var proxyUrl = '/hawtio/proxy/';
    var executionsListPath='context.json';
    export function jobExecutionContextController($scope,$routeParams, $resource) {
        var jobExecutionId=$routeParams.jobExecutionId;
        var jobName=$routeParams.jobName;
        var jobExecutionContext = $resource(proxyUrl+springBatchServerPath+executionsListPath);
        jobExecutionContext.get({'jobExecutionId':jobExecutionId},function(data){
            for(var context in data.jobExecutionContext){
                data.jobExecutionContext[context].id=context;
            }
            $scope.jobExecutionContext=data.jobExecutionContext;
            $scope.jobName=jobName;
        });
    }

}

