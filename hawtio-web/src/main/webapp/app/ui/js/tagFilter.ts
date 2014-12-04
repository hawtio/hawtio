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
      controller: ["$scope", "localStorage", "$location", ($scope, localStorage, $location) => {

        SelectionHelpers.decorate($scope);

        if (!Core.isBlank($scope.saveAs)) {
          var search = $location.search();
          if ($scope.saveAs in search) {
            $scope.selected.add(angular.fromJson(search[$scope.saveAs]));
          } else if ($scope.saveAs in localStorage) {
            $scope.selected.add(angular.fromJson(localStorage[$scope.saveAs]));
          }
        }

        function maybeFilterVisibleTags() {
          if($scope.collection && $scope.collectionProperty) {
            if (!$scope.selected.length) {
              $scope.visibleTags = $scope.tags;
              $scope.filteredCollection = $scope.collection;
            } else {
              filterVisibleTags();
            }
            $scope.visibleTags = $scope.visibleTags.map((t) => {
              return {
                id: t,
                count: $scope.filteredCollection.map((c) => {
                    return c[$scope.collectionProperty]; 
                  }).reduce((count, c) => {
                    if (c.any(t)) {
                      return count + 1;
                    }
                    return count;
                  }, 0)
              };
            });
          } else {
            $scope.visibleTags = $scope.tags;
          }
        }

        function filterVisibleTags() {
          $scope.filteredCollection = $scope.collection.filter((c) => {
            return SelectionHelpers.filterByGroup($scope.selected, c[$scope.collectionProperty]);
          });
          $scope.visibleTags = [];
          $scope.filteredCollection.forEach((c) => {
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
            var saveAs = angular.toJson($scope.selected);
            localStorage[$scope.saveAs] = saveAs;
            $location.search($scope.saveAs, saveAs);
          }
          maybeFilterVisibleTags();
        }, true);
      }]
    }
  }]);

}
