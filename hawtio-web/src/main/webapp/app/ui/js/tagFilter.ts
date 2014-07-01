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
        collectionProperty: '@'
      },
      controller: ["$scope", "$element", "$attrs", ($scope, $element, $attrs) => {
        log.debug("$scope: ", $scope);
        SelectionHelpers.decorate($scope);
        $scope.$watch('collection', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            log.debug("Collection property: ", $scope.collectionProperty);
          }
        });
        $scope.$watch('selected', (newValue, oldValue) => {
          if ($scope.collection && $scope.collectionProperty) {
            if ($scope.selected.length === 0) {
              $scope.visibleTags = $scope.tags;
            } else {
              var filtered = $scope.collection.filter((c) => {
                return SelectionHelpers.filterByGroup($scope.selected, c[$scope.collectionProperty]);
              });
              $scope.visibleTags = [];
              filtered.forEach((c) => {
                $scope.visibleTags = $scope.visibleTags.union(c[$scope.collectionProperty]);
              });
            }

          }
        }, true);
      }],
      link: ($scope, $element, $attrs) => {
        $scope.$watch('tags', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            SelectionHelpers.syncGroupSelection($scope.selected, $scope.tags);
            if($scope.collection && $scope.collectionProperty) {
              if (!$scope.selected.length) {
                $scope.visibleTags = $scope.tags;
              }
            } else {
              $scope.visibleTags = $scope.tags;
            }
          }
        });
      }
    }
  }]);

}
