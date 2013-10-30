module SpringBatch{

    export function SpringBatchJobExecutionListController($scope, $http) {

        $http.get('/hawtio/proxy/localhost:8181/jobs/executions.json',{
            cache:false
        }).success(function(data){
                $scope.jobExecutions=data.jobExecutions

            }).error(function(data){

            });


    }

    export function UtilController($scope) {

      $scope.encodedUrl =  function (data){return encodeURIComponent(data) }

    }

}

