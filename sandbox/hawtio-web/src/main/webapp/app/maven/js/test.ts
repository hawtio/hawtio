/**
 * @module Maven
 */
/// <reference path="./mavenPlugin.ts"/>
module Maven {
  _module.controller("Maven.TestController", ["$scope", "workspace", "jolokia", "$q", "$templateCache", ($scope, workspace, jolokia, $q, $templateCache) => {

    $scope.html = "text/html";

    $scope.someUri = '';
    $scope.uriParts = [];
    $scope.mavenCompletion = $templateCache.get("mavenCompletionTemplate");

    $scope.$watch('someUri', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.uriParts = newValue.split("/");
      }
    });

    $scope.$watch('uriParts', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue.length === 1 && newValue.length < oldValue.length) {
          if (oldValue.last() !== '' && newValue.first().has(oldValue.last())) {
            var merged = oldValue.first(oldValue.length - 1).include(newValue.first());
            $scope.someUri = merged.join('/');
          }
        }
      }
    }, true);

    $scope.doCompletionMaven = (something) => {
      return Maven.completeMavenUri($q, $scope, workspace, jolokia, something);
    }

  }]);
}
