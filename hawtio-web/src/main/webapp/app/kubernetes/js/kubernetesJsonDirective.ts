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
            var fabric8PropertiesFile = children.find((child) => { return child.name.toLowerCase() === "fabric8.properties";});
            var fabric8PropertiesURL:string = null;
            if (fabric8PropertiesFile) {
              fabric8PropertiesURL = Wiki.gitRestURL(fabric8PropertiesFile.branch, fabric8PropertiesFile.path);
              $http.get(fabric8PropertiesURL).
                success(function (data, status, headers, config) {
                  var fabric8Properties = data;
                  if (fabric8Properties) {
                    var nameRE = /(?:name)\s*=\s*(.+)[\n|$]/;
                    var matches = fabric8Properties.match(nameRE);
                    if (matches[1]) {
                      $scope.displayName = matches[1].replace(/\\/g, '');
                    }
                  }
                }).
                error(function (data, status, headers, config) {
                  log.warn("Failed to load " + fabric8PropertiesURL + " " + data + " " + status);
                });
            }
          }
        });

        $scope.apply = () => {
          var json = angular.toJson($scope.config);
          var name = $scope.appTitle || "App";
          runApp($location, jolokia, $scope, json, name, () => {
            // now lets navigate to the apps page so folks see things happen
            $location.url("/kubernetes/apps");
          });
        };
      }]
    };
  }]);
}
