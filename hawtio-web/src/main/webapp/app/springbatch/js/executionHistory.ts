module SpringBatch {

    export function ExecutionHistoryController($scope, $routeParams, $location, workspace:Workspace, $resource, $rootScope) {
        var springBatchServerOrigin = $rootScope.springBatchServer;
        var proxyUrl = '/hawtio/proxy/';
        var executionHistoryPath = 'jobs/:jobName/executions.json';
        $scope.predicate='id';
        $scope.reverse=false;

        var jobExecutionRes = $resource(proxyUrl+springBatchServerOrigin+executionHistoryPath);
        jobExecutionRes.get({'jobName':$routeParams.jobName},function(data){
            var executionList = new Array();
            for(var execution in data.jobExecutions){
                data.jobExecutions[execution].id=execution;
                executionList.add(data.jobExecutions[execution]);
            }
            $scope.executionHistory = executionList;
            $scope.jobName = $routeParams.jobName;
            $scope.jobId = $routeParams.jobId;
        })
    }
}