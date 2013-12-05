module SpringBatch{
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';
    var proxyUrl = '/hawtio';

    export function stepExecutionContextController($scope,$routeParams, $http) {
        var jobExecutionId=$routeParams.jobExecutionId;
        var stepExecutionId=$routeParams.stepExecutionId;
        var jobName=$routeParams.jobName;
        var jobId=$routeParams.jobId;

        var stepExecutionContext = $http.get(proxyUrl+"/contextFormatter?jobExecutionId="+jobExecutionId+"&stepExecutionId="+stepExecutionId+"&server="+springBatchServerOrigin+"&contextType=stepExecution")
            .success(function(data){
                $scope.htmlView=data;
            });
        $scope.jobName=jobName;
        $scope.jobId=jobId;


    }

}

