/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  export var hawtioFilter = _module.directive("hawtioFilter", [() => {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: UI.templatePath + 'filter.html',
      scope: {
        placeholder: '@',
        cssClass: '@',
        saveAs: '@?',
        ngModel: '='
      },
      controller: ["$scope", "localStorage", ($scope, localStorage) => {
        $scope.getClass = () => {
          var answer = [];
          if (!Core.isBlank($scope.cssClass)) {
            answer.push($scope.cssClass);
          }
          if (!Core.isBlank($scope.ngModel)) {
            answer.push("has-text");
          }
          return answer.join(' ');
        };
        if (!Core.isBlank($scope.saveAs)) {
          if ($scope.saveAs in localStorage) {
            $scope.ngModel = localStorage[$scope.saveAs];
          }
          $scope.$watch('ngModel', (newValue) => {
            localStorage[$scope.saveAs] = newValue;
          })
        }
      }]
    };
  }]);

}
