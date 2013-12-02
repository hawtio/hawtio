module SpringBatch{
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';

    var proxyUrl = '/hawtio';
    var executionsListPath='context.json';
    export function jobExecutionContextController($scope,$routeParams, $http) {
        console.info("****************"+proxyUrl+"/contextFormatter");
        var jobExecutionId=$routeParams.jobExecutionId;
        var jobName=$routeParams.jobName;
        var jobId=$routeParams.jobId;
        console.info("****************"+proxyUrl+"/contextFormatter");
        var jobExecutionContext = $http.get(proxyUrl+"/contextFormatter?jobExecutionId="+jobExecutionId+"&server="+springBatchServerOrigin)
            .success(function(data){
                $scope.htmlView=data;
            });
        $scope.jobId=jobId;
        $scope.jobName=jobName;


       /* jobExecutionContext.get(function(data){
           console.info("********************"+data);
        });*/
      /*  $scope.toString = function(value) {
            return JSON.stringify(value);
        }*/

    }

}

