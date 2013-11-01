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
        $scope.refreshJobInstance = function(jobInstance){
            var jobList = $resource(proxyUrl+springBatchServerPath);
            jobList.get({'jobName':jobName+'.json'},function(data){
                for(var job in data.job.jobInstances){
                    data.job.jobInstances[job].id=job;
                }
                var jobInstanceId=null;
                if(jobInstance && jobInstance.id){
                    jobInstanceId = jobInstance.id;
                    $scope.jobInstance = data.job.jobInstances[jobInstanceId];
                }else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        break;
                    }
                }
            });
        };
        $scope.fetchNextJobInstance = function(jobInstance){
            var tempId=null;
            var jobList = $resource(proxyUrl+springBatchServerPath);
            jobList.get({'jobName':jobName+'.json'},function(data){
                for(var job in data.job.jobInstances){
                    data.job.jobInstances[job].id=job;
                    if(jobInstance && jobInstance.id && (job>jobInstance.id)){
                        tempId=job;
                        break;
                    }else{tempId = job;}
                }
                if(jobInstance){
                    $scope.jobInstance = data.job.jobInstances[tempId];
                }
                else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        break;
                    }
                }
            });
        };
        $scope.fetchPrevJobInstance = function(jobInstance){
            var tempId=null;
            var jobList = $resource(proxyUrl+springBatchServerPath);
            jobList.get({'jobName':jobName+'.json'},function(data){
                for(var job in data.job.jobInstances){
                    data.job.jobInstances[job].id=job;
                    if(jobInstance && jobInstance.id && (job<jobInstance.id)){
                        tempId=job;
                    }
                }
                if(jobInstance){
                    if((tempId == null) && jobInstance.id){tempId = jobInstance.id;}
                    $scope.jobInstance = data.job.jobInstances[tempId];
                }
                else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        break;
                    }
                }
            });
        };

    }
}