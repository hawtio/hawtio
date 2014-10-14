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
      controller: ["$scope", "$location", "$http", "jolokia", ($scope, $location, $http, jolokia:Jolokia.IJolokia) => {
        var parentScope = $scope.$parent;

        $scope.$watch('config', (config) => {
          if (config) {
            log.debug("Got kubernetes configuration: ", config);
          } 
        });

        function pathToURL(path:string):string {
          if (path) {
            var branch = parentScope["branch"] || "master";
            return Wiki.gitRestURL(branch, path);
          } else {
            return null;
          }
        }

        parentScope.$watch('children', (children) => {
          $scope.appTitle = Wiki.fileName(parentScope["pageId"]);
          if (children) {
            $scope.children = children;
            $scope.summaryPath = (children.find({name: "Summary.md"}) || {})["path"];
            $scope.iconPath = (children.find(fileInfo => {
              var name = fileInfo["name"];
              return name && name.startsWith("icon.");
            }) || {})["path"];
            var branch = parentScope["branch"] || "master";
            if ($scope.iconPath) {
              $scope.iconURL = pathToURL($scope.iconPath);
            }
            if ($scope.summaryPath) {
              $scope.summaryURL = pathToURL($scope.summaryPath);

              // now lets load the summary
              log.info("Loading : " + $scope.summaryURL);
              $http.get($scope.summaryURL).
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
                  log.warn("Failed to load " + $scope.summaryURL + " " + data + " " + status);
                });
            }
            log.debug("got children " + children + " iconPath: " + $scope.iconPath + " summaryPath: " + $scope.summaryPath);
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
