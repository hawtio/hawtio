module SpringBatch {

    export function JobListController($scope, $location, workspace:Workspace, jolokia, $resource, $rootScope) {
        var springBatchServerPath = $rootScope.springBatchServer+'jobs.json';
        var proxyUrl = $rootScope.proxyUrl ;

        $scope.predicate = 'name';
        $scope.reverse = false;
        var jobList = $resource(proxyUrl+springBatchServerPath);
        jobList.get(function(data){
            if(data.jobs && data.jobs.registrations){
                var jobList = new Array();
                for(var job in data.jobs.registrations){
                    data.jobs.registrations[job].showLaunchForm=false;
                    data.jobs.registrations[job].launchParams='';
                    jobList.add(data.jobs.registrations[job]);
                    console.info(' ---------------- '+JSON.stringify(data.jobs.registrations[job]));
                }
                $scope.jobList = jobList;
            }
        });

        $scope.launchJob = function(jobName){

            var job ;
            for(var idx in $scope.jobList){ if( $scope.jobList[idx].name == jobName) job=$scope.jobList[idx]; }

            console.info(' --------------- '+ job.launchParams );
        }
    }

}