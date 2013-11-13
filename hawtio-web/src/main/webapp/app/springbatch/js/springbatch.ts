module SpringBatch {

    export function JobListController($scope, $location, workspace:Workspace, jolokia, $resource, $rootScope) {
        var springBatchServerPath = $rootScope.springBatchServer+'jobs.json';
        var proxyUrl = $rootScope.proxyUrl ;

        var jobList = $resource(proxyUrl+springBatchServerPath);
        jobList.get(function(data){
            if(data.jobs && data.jobs.registrations) $scope.jobList = data.jobs.registrations;
        });

    }

}