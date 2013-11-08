module SpringBatch {
    var springBatchServerOrigin = 'localhost\\:8080/spring-batch-admin-sample/';
    var springBatchServerOriginHttp = 'localhost:8080/spring-batch-admin-sample/';
    var springBatchServerPath =springBatchServerOrigin+'jobs/:jobName';
    var proxyUrl = '/hawtio/proxy/';
    var executionsListPath='/:jobInstanceId/executions.json';
    var paramsListPath = 'jobs/:jobName/:jobInstanceId';

    export function JobOverviewExecListController($scope,$routeParams, $location, workspace:Workspace, jolokia, $resource, $http) {

        var jobName = $routeParams.jobName;
        $scope.jobName = $routeParams.jobName;
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

        $scope.runJob = function(jobName,jobParams){
            console.info('-------------- job params------------------ '+JSON.stringify($scope.jobParams));


            if(jobName && jobParams){
                var postUrl = proxyUrl+springBatchServerOriginHttp+'jobs/'+jobName+'.json';
                console.info('-------------- POST URL ------------------ '+postUrl);
                $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
                var params = '';
                for(var param in jobParams){
                    params=params+jobParams[param].name+'='+jobParams[param].value;
                    if((param+1) != jobParams.length){params = params +',';}
                }
                params = encodeURIComponent(params);
                $http.post(postUrl,'jobParameters='+params)
                    .success(function(data){
                        console.info('-------------- RUN CALLED SUCCESS------------------ '+data);
                    })
                    .error(function(data){
                        console.info('-------------- RUN CALLED ERROR------------------ '+data);
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
                for(var execution in data.jobExecution.stepExecutions){
                    data.jobExecution.stepExecutions[execution].name = execution;
                }
                $scope.stepExecutionList = data.jobExecution.stepExecutions;
            });
        };


    }
}