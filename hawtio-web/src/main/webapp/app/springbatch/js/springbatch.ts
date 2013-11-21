module SpringBatch {
    var springBatchServerPath ='localhost\\:8080/spring-batch-admin-sample/jobs.json';
    var proxyUrl = '/hawtio/proxy/';
    export function JobListController($scope, $location, workspace:Workspace, jolokia, $resource) {

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

    }

}