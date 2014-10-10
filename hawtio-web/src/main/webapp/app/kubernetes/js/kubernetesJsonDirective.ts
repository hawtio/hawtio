/// <reference path="kubernetesPlugin.ts"/>
module Kubernetes {

  export var KubernetesJsonDirective = _module.directive("kubernetesJson", [() => {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: Kubernetes.templatePath + 'kubernetesJsonDirective.html',
      scope: {
        config: '=kubernetesJson'
      },
      controller: ["$scope", "jolokia", ($scope, jolokia:Jolokia.IJolokia) => {
        $scope.$watch('config', (config) => {
          if (config) {
            log.debug("Got kubernetes configuration: ", config);
          } 
        });

        $scope.apply = () => {
          var json = angular.toJson($scope.config);
          if (json) {
            jolokia.execute(Kubernetes.managerMBean, "apply", json, 
              onSuccess((response) => {
                log.debug("Got response: ", response);
              }));
            

          }
          log.debug("Clicked apply!");
        };
      }]
    };
  }]);
}
