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

    _module.controller("SpringBoot.MetricsController", ["$scope", "jolokia", ($scope, jolokia) => {
        jolokia.execute(metricsMBean, metricsMBeanOperation, onSuccess(function (data) {
            convertRawMetricsToUserFriendlyFormat($scope, data)
        }, {error: function(){
            $scope.loadingError = 'Cannot read metrics data.';
            $scope.$apply();
        }}));
    }]);

    _module.controller("SpringBoot.BeansController", ["$scope", "jolokia", ($scope, jolokia) => {
        jolokia.execute('org.springframework.boot:type=Endpoint,name=beansEndpoint', metricsMBeanOperation, onSuccess(function (data) {
            $scope.beans = data[0]['beans'];
            $scope.$apply();
        }, {error: function(){
            $scope.loadingError = 'Cannot read beans data.';
            $scope.$apply();
        }}));
    }]);

    hawtioPluginLoader.addModule(pluginName);
}
