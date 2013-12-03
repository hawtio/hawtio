module SpringBatch{
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';

    var proxyUrl = '/hawtio';
    export function jobExecutionContextController($scope,$routeParams, $http) {
        var jobExecutionId=$routeParams.jobExecutionId;
        var jobName=$routeParams.jobName;
        var jobId=$routeParams.jobId;
        var jobExecutionContext = $http.get(proxyUrl+"/contextFormatter?jobExecutionId="+jobExecutionId+"&server="+springBatchServerOrigin)
            .success(function(data){
                $scope.htmlView=data;
            });
        $scope.jobId=jobId;
        $scope.jobName=jobName;
    }

}

