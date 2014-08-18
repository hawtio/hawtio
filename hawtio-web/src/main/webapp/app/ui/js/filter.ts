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
      controller: ["$scope", "localStorage", "$location", "$element", ($scope, localStorage, $location, $element) => {

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

        // sync with local storage and the location bar, maybe could refactor this into a helper function
        if (!Core.isBlank($scope.saveAs)) {
          if ($scope.saveAs in localStorage) {
            $scope.ngModel = localStorage[$scope.saveAs];
          }
          /*
           // input loses focus when we muck with the search, at least on firefox
          var search = $location.search();
          if ($scope.saveAs in search) {
            $scope.ngModel = search[$scope.saveAs];
          }
          */

          var updateFunc = Core.throttled(() => {
            localStorage[$scope.saveAs] = $scope.ngModel;
            // input loses focus when we do this
            //$location.search($scope.saveAs, $scope.ngModel);
            Core.$apply($scope);
          }, 500);
          $scope.$watch('ngModel', updateFunc);
        }
      }]
    };
  }]);

}
