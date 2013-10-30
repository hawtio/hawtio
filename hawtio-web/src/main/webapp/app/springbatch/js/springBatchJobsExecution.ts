module SpringBatch{

      export function SpringBatchJobExecutionController($scope, $http) {
        $scope.getId=function(url){
           var newUrl=url.replace(/^https:/, "").replace(/^http:/, "");
            $http.get('/hawtio/proxy'+newUrl,{
                cache:false
            }).success(function(data){
                    console.info("*****I am here")
                    $scope.jobExecution=data.jobExecution
                }).error(function(data){

                });

        }


      }

}