module SpringBatch {
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';
    var springBatchServerPath =springBatchServerOrigin+'jobs/:jobName';
    var proxyUrl = '/hawtio/proxy/';
    var executionsListPath='/:jobInstanceId/executions.json';
    var paramsListPath = 'jobs/:jobName/:jobInstanceId';

    export function JobOverviewExecListController($scope,$routeParams, $location, workspace:Workspace, jolokia, $resource) {

        var jobName = $routeParams.jobName;
        var jobInstances = null;
        var jobList = $resource(proxyUrl+springBatchServerPath);

        $scope.executionPredicate = 'name';
        $scope.executionReverse = false;

        $scope.stepPredicate = 'name';
        $scope.stepReverse = false;

        $scope.fetchAllExecutions = function(jobInstance){
            if(jobInstance != undefined){
                var jobList = $resource(proxyUrl+springBatchServerPath+executionsListPath);
                jobList.get({'jobName':jobName,jobInstanceId:jobInstance.id},function(data){
                    var jobExecutionList = new Array();
                    for(var execution in data.jobInstance.jobExecutions){
                        data.jobInstance.jobExecutions[execution].id=execution;
                        jobExecutionList.add(data.jobInstance.jobExecutions[execution]);
                    }
                    $scope.jobExecutionList = jobExecutionList;
                });
            }
        };

        $scope.fetchParams = function(jobName,jobInstanceId,executionId){
            var paramsResource = $resource(proxyUrl+springBatchServerPath+paramsListPath);
            paramsResource.get({'jobName':jobName,'jobInstanceId':jobInstanceId+'.json'}, function(data){
                var jobParams = new Array();
                if(executionId){
                    for(var param in data.jobInstance.jobExecutions[executionId].jobParameters){
                        jobParams.add({'name':param,'value':data.jobInstance.jobExecutions[executionId].jobParameters[param]});
                    }
                }else{
                    for(var execution in data.jobInstance.jobExecutions){
                        for(var param in data.jobInstance.jobExecutions[execution].jobParameters){
                            jobParams.add({'name':param,'value':data.jobInstance.jobExecutions[execution].jobParameters[param]});
                        }
                        break;
                    }
                    $scope.jobParams = jobParams;
                }
            });
        };

        $scope.removeParam = function(jobParams,index){
            jobParams.splice(index,1);
        };

        $scope.addParam = function(jobParams,index){
            jobParams.add({name:'',value:''});
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
                $scope.fetchParams(jobName,$scope.jobInstance.id);
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
                    $scope.fetchParams(jobName,jobInstanceId);
                }else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        $scope.fetchAllExecutions(data.job.jobInstances[job]);
                        $scope.fetchParams(jobName,job);
                        break;
                    }
                }
                $scope.stepExecutionList = null;

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
                    $scope.fetchParams(jobName,tempId);
                }
                else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        $scope.fetchAllExecutions(data.job.jobInstances[job]);
                        $scope.fetchParams(jobName,job);
                        break;
                    }
                }
                $scope.stepExecutionList = null;
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
                    $scope.fetchParams(jobName,tempId);
                }
                else{
                    for(var job in data.job.jobInstances){
                        $scope.jobInstance = data.job.jobInstances[job];
                        $scope.fetchAllExecutions(data.job.jobInstances[job]);
                        $scope.fetchParams(jobName,job);
                        break;
                    }
                }
                $scope.stepExecutionList = null;
            });
        };

        $scope.fetchStepsForExecution = function(executionId){
            var jobList = $resource(proxyUrl+springBatchServerOrigin+'jobs/executions/:executionId');
            jobList.get({'executionId':executionId+'.json'},function(data){
                var stepList = new Array();
                for(var execution in data.jobExecution.stepExecutions){
                    data.jobExecution.stepExecutions[execution].name = execution;
                    stepList.add(data.jobExecution.stepExecutions[execution]);
                }
                $scope.stepExecutionList = stepList;
            });
        };


    }
}