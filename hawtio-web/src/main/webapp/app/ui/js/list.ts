/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  export function hawtioList($templateCache, $compile) {
    return {
      restrict: '',
      replace: true,
      templateUrl: UI.templatePath + 'list.html',
      scope: {
        'config': '=hawtioList'
      },
      link: ($scope, $element, $attr) => {

        $scope.rows = [];
        $scope.name = "hawtioListScope";

        if (!$scope.config.selectedItems) {
          $scope.config.selectedItems = [];
        }

        $scope.$watch('rows', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            $scope.config.selectedItems.length = 0;
            var selected = $scope.rows.findAll((row) => {
              return row.selected;
            });
            selected.forEach((row) => {
              $scope.config.selectedItems.push(row.entity);
            });
          }
        }, true);

        $scope.cellTemplate = $templateCache.get('cellTemplate.html');
        $scope.rowTemplate = $templateCache.get('rowTemplate.html');

        var columnDefs = $scope.config['columnDefs'];
        if (columnDefs && columnDefs.length > 0) {
          var def = columnDefs.first();
          if (def['cellTemplate']) {
            $scope.cellTemplate = def['cellTemplate'];
          }
        }

        var configName = $attr['hawtioList'];
        var dataName = $scope.config['data'];

        if (Core.isBlank(configName) || Core.isBlank(dataName)) {
          return;
        }

        $scope.listRoot = () => {
          return $element.find('.list-root');
        };

        $scope.getContents = (row) => {
          //first make our row
          var innerScope = $scope.$new();
          innerScope.row = row;
          var rowEl = $compile($scope.rowTemplate)(innerScope);


          //now compile the cell but use the parent scope
          var innerParentScope = $scope.parentScope.$new();
          innerParentScope.row = row;
          var cellEl = $compile($scope.cellTemplate)(innerParentScope);
          $(rowEl).find('.list-row-contents').append(cellEl);
          return rowEl;
        };


        $scope.setRows = (data) => {
          $scope.rows = [];
          var list = $scope.listRoot();
          list.empty();
          if (data) {
            data.forEach((row) => {
              var newRow = {
                entity: row
              };
              list.append($scope.getContents(newRow));
              $scope.rows.push(newRow);
            });
          }
        };

        // find the parent scope that has our configuration
        var parentScope = findParentWith($scope, configName);
        if (parentScope) {
          $scope.parentScope = parentScope;
          parentScope.$watch(dataName, $scope.setRows, true)
        }
      }
    };
  }

  _module.directive('hawtioList', ["$templateCache", "$compile", UI.hawtioList]);

}
