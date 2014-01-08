module SpringBatch {

    export var templatePath = 'app/springbatch/html/';
    export var pluginName = 'SpringBatch';

    angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'hawtio-ui']).
        config(($routeProvider) => {
            $routeProvider
                .when('/springbatch/servers', {templateUrl: SpringBatch.templatePath + 'serverList.html'})
                .when('/springbatch/jobs', {templateUrl: SpringBatch.templatePath + 'jobs.html'})
                .when('/springbatch/jobs/:jobName/executions', {templateUrl: SpringBatch.templatePath + 'overview.html'})
                .when('/springbatch/jobs/:jobName/executions/:jobInstanceId', {templateUrl: SpringBatch.templatePath + 'overview.html'})
                .when('/springbatch/jobs/executions', {templateUrl: SpringBatch.templatePath + 'jobsExecutionList.html'})
                .when('/springbatch/connect', {templateUrl: SpringBatch.templatePath + 'connectSpringBatch.html'})
                .when('/springbatch/jobs/:jobId/executions/:jobName/:jobExecutionId', {templateUrl: SpringBatch.templatePath + 'jobExecutionContext.html'})
                .when('/springbatch/jobs/:jobName/:jobId/history/executions', {templateUrl: SpringBatch.templatePath + 'executionHistory.html'})
                .when('/springbatch/jobs/:jobId/executions/:jobName/:jobExecutionId/steps/:stepExecutionId', {templateUrl: SpringBatch.templatePath + 'stepExecutionContext.html'})

        }).
        value('ui.config', {
            // The ui-jq directive namespace
            jq: {
                gridster: {
                    widget_margins: [10, 10],
                    widget_base_dimensions: [140, 140]
                }
            }
        }).

        run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, $rootScope, $resource ) => {

            viewRegistry['springbatch'] = 'app/springbatch/html/layoutSpringBatch.html';

            workspace.topLevelTabs.push({
                content: "SpringBatch",
                title: "View Spring-Batch jobs",
                isValid: (workspace: Workspace) => true,
                href: () => "#/springbatch/servers",
                isActive: (workspace: Workspace) => workspace.isTopTabActive("springbatch")
            });


            var serverListRes = $resource('/hawtio/springBatch');
            serverListRes.get(function(data){
                $rootScope.springBatchServerList = data.springBatchServerList || [
                    'localhost\\:8080/spring-batch-admin-sample/',
                    'localhost\\:8181/'
                ];

                $rootScope.springBatchServer = $rootScope.springBatchServerList[0];
            });

            $rootScope.proxyUrl = '/hawtio/proxy/';

            $rootScope.alert = {
                enable:false,
                content:'',
                type:'',
                hide: function(){
                    this.enable = false;
                },
                show: function(){
                    this.enable = true;
                }
            };
        });

    hawtioPluginLoader.addModule(pluginName);
}