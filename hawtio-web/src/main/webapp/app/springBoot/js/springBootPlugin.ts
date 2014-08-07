/**
 * @module SpringBoot
 * @main SpringBoot
 */
module SpringBoot {



    var pluginName = 'springBoot';
    export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ui.bootstrap.dialog', 'hawtioCore']);
    _module.config(["$routeProvider", ($routeProvider) => {
        $routeProvider.
            when('/springBoot', {templateUrl: 'app/springBoot/html/springBoot.html'});
    }]);

    _module.run(["$location", "$http", "workspace", "viewRegistry", "helpRegistry", "jolokia", ($location:ng.ILocationService, $http, workspace:Workspace, viewRegistry, helpRegistry, jolokia) => {

        viewRegistry['springBoot'] = "app/springBoot/html/springBoot.html";

        callIfSpringBootAppAvailable(jolokia, function () {
            workspace.topLevelTabs.push({
                id: "springBoot",
                content: "Spring Boot",
                title: "Manage your Spring Boot application",
                isValid: function (workspace) {
                    return true;
                },
                href: function () {
                    return "#/springBoot";
                },
                isActive: function (workspace) {
                    return workspace.isTopTabActive("springBoot");
                }
            });
        });

    }]);

    _module.controller("SpringBoot.MainController", ["$scope", "$http", "$location", "workspace", "jolokia", ($scope, $http, $location, workspace:Workspace, jolokia) => {
        jolokia.execute(metricsMBean, metricsMBeanOperation, onSuccess(function (data) {
            convertRawMetricsToUserFriendlyFormat($scope, data)
        }, {error: function(){
            $scope.loadingError = 'Cannot read metrics data.';
            $scope.$apply();
        }}));
    }]);

    hawtioPluginLoader.addModule(pluginName);
}
