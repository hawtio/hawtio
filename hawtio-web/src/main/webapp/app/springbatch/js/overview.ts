module SpringBatch {
    var springBatchServerPath ='localhost\\:8080/spring-batch-admin-sample/jobs/:jobName';
    var proxyUrl = '/hawtio/proxy/';
    export function JobOverviewExecListController($scope,$routeParams, $location, workspace:Workspace, jolokia, $resource) {

        var jobName = $routeParams.jobName;
        var jobInstances = null;
        var jobList = $resource(proxyUrl+springBatchServerPath);
        jobList.get({'jobName':jobName+'.json'},function(data){
            for(var job in data.job.jobInstances){
                data.job.jobInstances[job].id=job;
                jobInstances = data.job.jobInstances;
            }
            if($routeParams.jobInstanceId == undefined){
                for(var job in data.job.jobInstances){
                    $scope.jobInstance = jobInstances[job];
                    break;
                }
            }else{
                if(jobInstances && jobInstances[$routeParams.jobInstanceId]){
                    $scope.jobInstance = jobInstances[$routeParams.jobInstanceId];

                }
            }
        });

    }
}