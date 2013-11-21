module SpringBatch {

    export var templatePath = 'app/springbatch/html/';
    export var pluginName = 'SpringBatch';

    angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'hawtio-ui']).
        config(($routeProvider) => {
            $routeProvider
                .when('/springbatch/jobs', {templateUrl: SpringBatch.templatePath + 'jobs.html'})
                .when('/springbatch/jobs/:jobName/executions', {templateUrl: SpringBatch.templatePath + 'overview.html'})
                .when('/springbatch/jobs/:jobName/executions/:jobInstanceId', {templateUrl: SpringBatch.templatePath + 'overview.html'})
                .when('/springbatch/jobs/:jobName/history/executions', {templateUrl: SpringBatch.templatePath + 'executionHistory.html'})
                .when('/springbatch/jobs/executions', {templateUrl: SpringBatch.templatePath + 'jobsExecutionList.html'})

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

        run(($location:ng.ILocationService, workspace:Workspace, viewRegistry) => {

            viewRegistry['springbatch'] = 'app/springbatch/html/layoutSpringBatch.html';

            workspace.topLevelTabs.push({
                content: "SpringBatch",
                title: "View Spring-Batch jobs",
                isValid: (workspace: Workspace) => true,
                href: () => "#/springbatch/jobs",
                isActive: (workspace: Workspace) => workspace.isTopTabActive("springbatch")
            });


        });

    hawtioPluginLoader.addModule(pluginName);
}