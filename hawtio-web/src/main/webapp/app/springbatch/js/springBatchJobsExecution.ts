module SpringBatch{
    export function SpringBatchJobExecutionController($scope, $http,$routeParams) {
        var newUrl=decodeURIComponent($routeParams.url).replace(/^https:/, "").replace(/^http:/, "");
        $http.get('/hawtio/proxy'+newUrl,{
            cache:false
        }).success(function(data){
                $scope.jobExecution=data.jobExecution

            }).error(function(data){

            });

    }
}