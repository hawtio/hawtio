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
                    jobList.add(data.jobs.registrations[job]);
                }
                $scope.jobList = jobList;
            }
        });

        $scope.launchDiv = function(jobName){
            console.info(' --------------- '+jobName);
        }
    }

}