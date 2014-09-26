/// <reference path="./springbatchPlugin.ts"/>
module SpringBatch{
    _module.controller("SpringBatch.stepExecutionContextController", ["$scope", "$routeParams", "$http", "$rootScope", ($scope, $routeParams, $http, $rootScope) => {
        var springBatchServerOrigin = $rootScope.springBatchServer;
        var proxyUrl = '/hawtio';
        var jobExecutionId=$routeParams.jobExecutionId;
        var stepExecutionId=$routeParams.stepExecutionId;
        var jobName=$routeParams.jobName;

        var jobId=$routeParams.jobId;
        $scope.springBatchServer = springBatchServerOrigin;
        var stepExecutionContext = $http.get(proxyUrl+"/contextFormatter?jobExecutionId="+jobExecutionId+"&stepExecutionId="+stepExecutionId+"&server="+springBatchServerOrigin+"&contextType=stepExecution")
            .success(function(data){
                $scope.htmlView=data;
            });
        $scope.jobName=jobName;
        $scope.jobId=jobId;
    }]);
}

