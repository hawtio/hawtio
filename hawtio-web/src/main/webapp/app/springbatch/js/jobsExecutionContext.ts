module SpringBatch{

    export function jobExecutionContextController($scope,$routeParams, $http, $rootScope) {
        var springBatchServerOrigin = $rootScope.springBatchServer;
        var proxyUrl = '/hawtio';
        var jobExecutionId=$routeParams.jobExecutionId;
        var jobName=$routeParams.jobName;
        var jobId=$routeParams.jobId;
        $scope.springBatchServer = springBatchServerOrigin;
        var jobExecutionContext = $http.get(proxyUrl+"/contextFormatter?jobExecutionId="+jobExecutionId+"&server="+springBatchServerOrigin+"&contextType=jobExecution")
            .success(function(data){
                $scope.htmlView=data;
            });
        $scope.jobId=jobId;
        $scope.jobName=jobName;

    }
}

