module UI {

  export var selected = "selected";
  export var unselected = "unselected";


  export var colors = ["#5484ED", "#A4BDFC", "#46D6DB", "#7AE7BF",
    "#51B749", "#FBD75B", "#FFB878", "#FF887C", "#DC2127",
    "#DBADFF", "#E1E1E1"];

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

    public controller = ($scope, $element, $timeout) => {

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
    }
  }

}
