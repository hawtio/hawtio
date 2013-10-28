module SpringBatch {

    export var templatePath = 'app/springbatch/html/';
    export var pluginName = 'springbatch';

    angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'hawtio-ui']).
        config(($routeProvider) => {

            $routeProvider.
                when('/springbatch/jobs', {templateUrl: SpringBatch.templatePath + 'jobs.html'})

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