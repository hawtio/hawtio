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
      controller: ["$scope", "$location", "jolokia", ($scope, $location, jolokia:Jolokia.IJolokia) => {
        $scope.$watch('config', (config) => {
          if (config) {
            log.debug("Got kubernetes configuration: ", config);
          } 
        });

        $scope.apply = () => {
          var json = angular.toJson($scope.config);
          if (json) {
            // TODO find app name from parent scope...
            var name = "App";
            Core.notification('info', "Running " + name);
            jolokia.execute(Kubernetes.managerMBean, "apply", json,
              onSuccess((response) => {
                log.debug("Got response: ", response);

                // now lets navigate to the pods page so folks see things happen
                $location.url("/kubernetes/pods");
                Core.$apply($scope);
              }));
            

          }
          log.debug("Clicked apply!");
        };
      }]
    };
  }]);
}
