module SpringBatch {
    var springBatchServerPath ='http://localhost:8080/spring-batch-admin-sample/jobs.json';

    export function SpringBatchController($scope, $location, workspace:Workspace, jolokia, $http) {

        console.info('hello world............');

       /* var jobList = jobs.get({action:'jobs.json'},function($response){
            console.info($response.jobs);
        });*/

        /*function jsonp_callback(data) {
            // returning from async callbacks is (generally) meaningless
            console.info(data);
        }*/
        $http.defaults.headers.get = {'Origin':'','Referer':''};
        $http.get('http://localhost:8080/jobs.json').success(function(json) {
            console.info(json, json.jobs);
            $scope.page = json;
        });
    }
}