module SpringBatch {
    var springBatchServerPath ='localhost\\:8080/spring-batch-admin-sample/jobs/:jobName';
    var proxyUrl = '/hawtio/proxy/';
    var executionsListPath='/:jobInstanceId/executions.json';

    export function JobOverviewExecListController($scope,$routeParams, $location, workspace:Workspace, jolokia, $resource) {

        var jobName = $routeParams.jobName;
        var jobInstances = null;
        var jobList = $resource(proxyUrl+springBatchServerPath);

        $scope.fetchAllExecutions = function(jobInstance){
            if(jobInstance != undefined){
                var jobList = $resource(proxyUrl+springBatchServerPath+executionsListPath);
                jobList.get({'jobName':jobName,jobInstanceId:jobInstance.id},function(data){
                    for(var execution in data.jobInstance.jobExecutions){
                        data.jobInstance.jobExecutions[execution].id=execution;
                    }
                    $scope.jobExecutionList = data.jobInstance.jobExecutions;
                });
            }
        };

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
            if($scope.jobInstance){
                $scope.fetchAllExecutions($scope.jobInstance);
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
                    $scope.fetchAllExecutions(data.job.jobInstances[jobInstanceId]);
                }else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        $scope.fetchAllExecutions(data.job.jobInstances[job]);
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
                    $scope.fetchAllExecutions(data.job.jobInstances[tempId]);
                }
                else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        $scope.fetchAllExecutions(data.job.jobInstances[job]);
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
                    $scope.fetchAllExecutions(data.job.jobInstances[tempId]);
                }
                else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        $scope.fetchAllExecutions(data.job.jobInstances[job]);
                        break;
                    }
                }
            });
        };


    }
}