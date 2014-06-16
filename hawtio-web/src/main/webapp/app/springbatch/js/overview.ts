/// <reference path="./springbatchPlugin.ts"/>
module SpringBatch {

    _module.controller("SpringBatch.JobOverviewExecListController", ["$scope", "$routeParams", "$location", "workspace", "jolokia", "$resource", "$rootScope", "$http", ($scope,$routeParams, $location, workspace:Workspace, jolokia, $resource, $rootScope,$http) => {

        var springBatchServerOrigin = $rootScope.springBatchServer;
        var springBatchServerPath = springBatchServerOrigin+'jobs/:jobName';
        var proxyUrl = $rootScope.proxyUrl;
        var executionsListPath='/:jobInstanceId/executions.json';
        var paramsListPath = 'jobs/:jobName/:jobInstanceId';
        var jobName = $routeParams.jobName;
        $scope.jobName = $routeParams.jobName;
        var jobInstances = null;
        var jobList = $resource(proxyUrl+springBatchServerPath);
        $scope.springBatchServer = encodeURIComponent(springBatchServerOrigin);

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
                    $scope.jobName = jobName;
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

        $scope.runJob = function(jobName,jobParams){
            if(jobName && jobParams){
                var springServerOrigin=springBatchServerOrigin.replace('\\','');
                var postUrl = proxyUrl+springServerOrigin+'jobs/'+jobName+'.json';
                $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
                var params = '';
                for(var param in jobParams){
                    params=params+jobParams[param].name+'='+jobParams[param].value;
                    if((param+1) != jobParams.length){params = params +',';}
                }
                params = encodeURIComponent(params);
                $http.post(postUrl,'jobParameters='+params)
                    .success(function(data){
                        if(data.jobExecution){
                            $rootScope.alert.content='Job started successfully.';
                            $rootScope.alert.type = 'alert-success';
                            $rootScope.alert.show();
                        }else if(data.errors){
                            $rootScope.alert.content='';
                            for(var message in data.errors){
                                $rootScope.alert.content+=data.errors[message]+'\n';
                                $rootScope.alert.type = 'alert-error';
                                $rootScope.alert.show();
                            }
                        }
                    })
                    .error(function(data){
                        $rootScope.alert.content='Count not start the job';
                        $rootScope.alert.type = 'alert-error';
                        $rootScope.alert.show();
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
            else{
                $scope.jobParams = new Array();
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
                    if(jobInstance && jobInstance.id && (parseInt(job)>parseInt(jobInstance.id))){
                        tempId=job;
                        break;
                    }else if(jobInstance && jobInstance.id){tempId = jobInstance.id;}
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
                if($scope.jobInstance){
                    $scope.fetchAllExecutions($scope.jobInstance);
                    $scope.fetchParams(jobName,$scope.jobInstance.id);
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
                    if(jobInstance && jobInstance.id && (parseInt(job)<parseInt(jobInstance.id))){
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
                if($scope.jobInstance){
                    $scope.fetchAllExecutions($scope.jobInstance);
                    $scope.fetchParams(jobName,$scope.jobInstance.id);
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
                $scope.executionId = executionId;
                $scope.stepExecutionList = stepList;
            });
        };
    }]);
}
