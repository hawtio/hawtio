module SpringBatchJobExecution {

    export function SpringBatchJobExecutionController($scope, $http) {
        $http.get('/hawtio/proxy/localhost:8181/jobs/executions.json',{
            cache:false
        }).success(function(data){
                $scope.jobExecutions=data.jobExecutions
            }).error(function(data){

            });

    }

}