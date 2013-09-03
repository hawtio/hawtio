module UI {

  export class ViewportHeight {
    public restrict = 'A';

    /*
    public scope = {
      targetId: '@hawtioViewport',
      containingDiv: '@',
      heightAdjust: '@'
    };
    */

    public link = ($scope, $element, $attrs) => {

      var lastHeight = 0;

      var resizeFunc = () => {

        var neighbor = (<any>angular).element($attrs['hawtioViewport']);
        var container = (<any>angular).element($attrs['containingDiv']);

        var start = neighbor.position().top + neighbor.height();

        var myHeight = container.height() - start;
        if (angular.isDefined($attrs['heightAdjust'])) {
          var heightAdjust = $attrs['heightAdjust'].toNumber();
        }
        myHeight = myHeight + heightAdjust;

        $element.css({
          height: myHeight,
          'min-height': myHeight
        });

        if (lastHeight !== myHeight) {
          lastHeight = myHeight;
          $element.trigger('resize');
        }

      };

      resizeFunc();
      $scope.$watch(resizeFunc);

      $().resize(() => {
        resizeFunc();
        Core.$apply($scope);
        return false;
      })


    };

  }
}
