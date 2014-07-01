/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
module UI {

  export var hawtioTagFilter = _module.directive("hawtioTagFilter", [() => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: UI.templatePath + 'tagFilter.html',
      scope: {
        selected: '=',
        tags: '=',
        collection: '=?',
        collectionProperty: '@',
        saveAs: '@'
      },
      controller: ["$scope", "localStorage", ($scope, localStorage) => {
        SelectionHelpers.decorate($scope);
        if (!Core.isBlank($scope.saveAs)) {
          if ($scope.saveAs in localStorage) {
            $scope.selected.add(angular.fromJson(localStorage[$scope.saveAs]));
          }
        }

        function maybeFilterVisibleTags() {
          if($scope.collection && $scope.collectionProperty) {
            if (!$scope.selected.length) {
              $scope.visibleTags = $scope.tags;
            } else {
              filterVisibleTags();
            }
          } else {
            $scope.visibleTags = $scope.tags;
          }
        }

        function filterVisibleTags() {
          var filtered = $scope.collection.filter((c) => {
            return SelectionHelpers.filterByGroup($scope.selected, c[$scope.collectionProperty]);
          });
          $scope.visibleTags = [];
          filtered.forEach((c) => {
            $scope.visibleTags = $scope.visibleTags.union(c[$scope.collectionProperty]);
          });
        }

        $scope.$watch('tags', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            SelectionHelpers.syncGroupSelection($scope.selected, $scope.tags);
            maybeFilterVisibleTags();
          }
        });
        $scope.$watch('selected', (newValue, oldValue) => {
          if (!Core.isBlank($scope.saveAs)) {
            localStorage[$scope.saveAs] = angular.toJson($scope.selected);
          }
          maybeFilterVisibleTags();
        }, true);
      }]
    }
  }]);

}
