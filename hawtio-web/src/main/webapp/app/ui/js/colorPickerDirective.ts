/**
 * @module UI
 */
/// <reference path="./colors.ts"/>
/// <reference path="./uiPlugin.ts"/>
module UI {

  _module.directive('hawtioColorPicker', () => {
    return new UI.ColorPicker()
  });

  export var selected:string = "selected";
  export var unselected:string = "unselected";

  /**
Directive that allows the user to pick a color from a pre-defined pallete of colors.

Use it like:

```html
<div hawtio-color-picker="myModel"></div>
```

'myModel' will be bound to the color the user clicks on

@class ColorPicker
   */
  export class ColorPicker {
    public restrict = 'A';
    public replace = true;
    public scope = {
      property: '=hawtioColorPicker'
    };
    public templateUrl = UI.templatePath + "colorPicker.html";


    public compile = (tElement, tAttrs, transclude) => {
      return {
        post: function postLink(scope, iElement, iAttrs, controller) {

          scope.colorList = [];

          angular.forEach(colors, function (color) {

            var select = unselected;

            if (scope.property === color) {
              select = selected;
            }

            scope.colorList.push({
              color: color,
              select: select
            });
          });
        }
      };
    };

    public controller = ["$scope", "$element", "timeout", ($scope, $element, $timeout) => {

      $scope.popout = false;

      $scope.$watch('popout', () => {
        $element.find('.color-picker-popout').toggleClass('popout-open', $scope.popout);
      });

      $scope.selectColor = (color) => {
        for (var i = 0; i < $scope.colorList.length; i++) {
          $scope.colorList[i].select = unselected;
          if ($scope.colorList[i] === color) {
            $scope.property = color.color;
            $scope.colorList[i].select = selected;
          }
        }
      };
    }]
  }

}
