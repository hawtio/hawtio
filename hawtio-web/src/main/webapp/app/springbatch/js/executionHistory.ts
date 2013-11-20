module SpringBatch {
    var springBatchServerOrigin = 'localhost\\:8181/';
    var proxyUrl = '/hawtio/proxy/';
    var executionHistoryPath = 'jobs/:jobName/executions.json';
    export function ExecutionHistoryController($scope, $routeParams, $location, workspace:Workspace, $resource) {

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
        })
    }
}