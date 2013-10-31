module SpringBatch{

    export function SpringBatchJobExecutionListController($scope, $http) {

        $http.get('/hawtio/proxy/localhost:8181/jobs/executions.json',{
            cache:false
        }).success(function(data){
                for(var execution in data.jobExecutions){
                    data.jobExecutions[execution].id=execution;
                }
                console.info(data.jobExecutions)
                $scope.jobExecutions=data.jobExecutions

            }).error(function(data){

            });

    }

}

