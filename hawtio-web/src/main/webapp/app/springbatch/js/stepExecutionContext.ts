module SpringBatch{
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';
    var springBatchServerPath =springBatchServerOrigin+'jobs/executions/:jobExecutionId/steps/:stepExecutionId/';

    var proxyUrl = '/hawtio/proxy/';
    var executionsListPath='context.json';
    export function stepExecutionContextController($scope,$routeParams, $resource) {
        var jobExecutionId=$routeParams.jobExecutionId;
        var stepExecutionId=$routeParams.stepExecutionId;
        var jobName=$routeParams.jobName;
        var jobId=$routeParams.jobId;
        var jobExecutionContext = $resource(proxyUrl+springBatchServerPath+executionsListPath);
        jobExecutionContext.get({'jobExecutionId':jobExecutionId,'stepExecutionId':stepExecutionId},function(data){
            $scope.stepExecutionContext=data.stepExecutionContext;
            $scope.jobName=jobName;
            $scope.jobId=jobId;
        });
    }

}

