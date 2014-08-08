/**
 * @module SpringBoot
 * @main SpringBoot
 */
module SpringBoot {

    var pluginName = 'springBoot';
    export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ui.bootstrap.dialog', 'hawtioCore']);
    _module.config(["$routeProvider", ($routeProvider) => {
        $routeProvider.
            when('/springBoot/metrics', {templateUrl: 'app/springBoot/html/metrics.html'}).
            when('/springBoot/beans', {templateUrl: 'app/springBoot/html/beans.html'});
    }]);

    _module.run(["$location", "$http", "workspace", "viewRegistry", "helpRegistry", "jolokia", ($location:ng.ILocationService, $http, workspace:Workspace, viewRegistry, helpRegistry, jolokia) => {

        viewRegistry['springBoot'] = "app/springBoot/html/layoutSpringBootTabs.html";

        callIfSpringBootAppAvailable(jolokia, function () {
            workspace.topLevelTabs.push({
                id: "springBoot",
                content: "Spring Boot",
                title: "Manage your Spring Boot application",
                isValid: function (workspace) {
                    return true;
                },
                href: function () {
                    return "#/springBoot/metrics";
                },
                isActive: function (workspace) {
                    return workspace.isTopTabActive("springBoot");
                }
            });
        });

    }]);

    hawtioPluginLoader.addModule(pluginName);
}
