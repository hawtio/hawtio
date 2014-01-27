module SpringBatch{

    export function SpringBatchJobExecutionListController($scope, $resource, $rootScope) {
        var springBatchServerOrigin = $rootScope.springBatchServer;
        if(springBatchServerOrigin == undefined){
            $rootScope.alert.content='No Server selected. Please, use Connect or Server List screen to select one.';
            $rootScope.alert.type = 'alert-error';
            $rootScope.alert.show();
            return;
        }
        var springBatchServerPath = springBatchServerOrigin+'jobs';
        var proxyUrl = $rootScope.proxyUrl;
        var executionsListPath='/executions.json';

        $scope.predicate = 'name';
        $scope.reverse = false;

        var executionListRes = $resource(proxyUrl+springBatchServerPath+executionsListPath);
        executionListRes.get(function(data){
            var executionList = new Array();
            for(var execution in data.jobExecutions){
                data.jobExecutions[execution].id=execution;
                executionList.add(data.jobExecutions[execution]);
            }
            $scope.jobExecutions = executionList;
        });
    }

}
