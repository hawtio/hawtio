/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  _module.directive('gridster', () => {
    return new UI.GridsterDirective();
  });

  export class GridsterDirective {

    public restrict = 'A';
    public replace = true;

    public controller = ["$scope", "$element", "$attrs", ($scope, $element, $attrs) => {

    }];

    public link = ["$scope", "$element", "$attrs", ($scope, $element, $attrs) => {

      var widgetMargins = [6, 6];
      var widgetBaseDimensions = [150, 150];
      var gridSize = [150, 150];
      var extraRows = 10;
      var extraCols = 6;

      /*
      if (angular.isDefined($attrs['dimensions'])) {
        var dimension = $attrs['dimensions'].toNumber();
        widgetBaseDimensions = [dimension, dimension];
      }


      if (angular.isDefined($attrs['margins'])) {
        var margins = $attrs['margins'].toNumber();
        widgetMargins = [margins, margins];
      }

      if (angular.isDefined($attrs['gridSize'])) {
        var size = $attrs['gridSize'].toNumber();
        gridSize = [size, size];
      }
      */

      if (angular.isDefined($attrs['extraRows'])) {
        extraRows = $attrs['extraRows'].toNumber();
      }

      if (angular.isDefined($attrs['extraCols'])) {
        extraCols = $attrs['extraCols'].toNumber();
      }

      var grid =$('<ul style="margin: 0"></ul>');

      var styleStr = '<style type="text/css">';

      var styleStr = styleStr + '</style>';

      $element.append($(styleStr));
      $element.append(grid);

      $scope.gridster = grid.gridster({
        widget_margins: widgetMargins,
        grid_size: gridSize,
        extra_rows: extraRows,
        extra_cols: extraCols
      }).data('gridster');

    }];
  }

}
