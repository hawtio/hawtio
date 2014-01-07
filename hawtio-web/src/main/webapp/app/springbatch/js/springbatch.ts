module SpringBatch {

    export function JobListController($scope, $location, workspace:Workspace, jolokia, $resource, $rootScope, $http) {
        var springBatchServerPath = $rootScope.springBatchServer+'jobs.json';
        var proxyUrl = $rootScope.proxyUrl ;

        $scope.predicate = 'name';
        $scope.reverse = false;


        $scope.getJobList = function(){
            var jobList = $resource(proxyUrl+springBatchServerPath);
            jobList.get(function(data){
                if(data.jobs && data.jobs.registrations){
                    var jobList = new Array();
                    for(var job in data.jobs.registrations){
                        data.jobs.registrations[job].showLaunchForm=false;
                        data.jobs.registrations[job].launchParams='';
                        jobList.add(data.jobs.registrations[job]);
                    }
                    $scope.jobList = jobList;
                }
            });
        };

        $scope.getJobList();

        $scope.launchJob = function(jobName){

            var job ;
            for(var idx in $scope.jobList){ if( $scope.jobList[idx].name == jobName) job=$scope.jobList[idx]; }
            var params = job.launchParams;

            if(jobName && params){
                var springServerOrigin=$rootScope.springBatchServer.replace('\\','');
                var postUrl = proxyUrl+springServerOrigin+'jobs/'+jobName+'.json';
                $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
                params = encodeURIComponent(params);
                $http.post(postUrl,'jobParameters='+params)
                    .success(function(data){
                        if(data.jobExecution){
                            $rootScope.alert.content='Job started successfully.';
                            $rootScope.alert.type = 'alert-success';
                            $rootScope.alert.show();
                            $scope.getJobList();
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
        }
    }

}