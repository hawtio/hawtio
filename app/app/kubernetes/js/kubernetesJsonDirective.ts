/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../wiki/js/wikiHelpers.ts"/>
module Kubernetes {

  export var KubernetesJsonDirective = _module.directive("kubernetesJson", [() => {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: Kubernetes.templatePath + 'kubernetesJsonDirective.html',
      scope: {
        config: '=kubernetesJson'
      },
      controller: ["$scope", "$location", "$http", "jolokia", "marked", ($scope, $location, $http, jolokia:Jolokia.IJolokia, marked) => {

        $scope.$watch('config', (config) => {
          if (config) {
            if (config.error) {
              log.debug("Error parsing kubernetes config: ", config.error);
            } else {
              log.debug("Got kubernetes configuration: ", config);
            }
          } else {
            log.debug("Kubernetes config unset");
          }
        });

        $scope.$on('Wiki.ViewPage.Children', ($event, pageId, children) => {
          // log.debug("Got broadcast, pageId: ", pageId, " children: ", children);
          $scope.appTitle = pageId;
          if (children) {
            var summaryFile = children.find((child) => { return child.name.toLowerCase() === "summary.md";});
            var summaryURL:string = null;
            if (summaryFile) {
              summaryURL = Wiki.gitRestURL(summaryFile.branch, summaryFile.path);
              $http.get(summaryURL).
                success(function (data, status, headers, config) {
                  var summaryMarkdown = data;
                  if (summaryMarkdown) {
                    $scope.summaryHtml = marked(summaryMarkdown);
                  } else {
                    $scope.summaryHtml = null;
                  }
                }).
                error(function (data, status, headers, config) {
                  $scope.summaryHtml = null;
                  log.warn("Failed to load " + summaryURL + " " + data + " " + status);
                });
            }
            var iconFile = children.find((child) => { return child.name.toLowerCase().startsWith("icon"); });
            if (iconFile) {
              $scope.iconURL = Wiki.gitRestURL(iconFile.branch, iconFile.path);
            }
          }
        });

        $scope.apply = () => {
          var json = angular.toJson($scope.config);
          if (json) {
            var name = $scope.appTitle || "App";
            Core.notification('info', "Running " + name);

            jolokia.execute(Kubernetes.managerMBean, "apply", json,
              onSuccess((response) => {
                log.debug("Got response: ", response);

                // now lets navigate to the pods page so folks see things happen
                $location.url("/kubernetes/pods");
                Core.$apply($scope);
              }));
          }
        };
      }]
    };
  }]);
}
