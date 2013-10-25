module UI {

  export class AutoColumns {
    public restrict = 'A';

    public link = ($scope, $element, $attr) => {

      var selector = getIfSet('hawtioAutoColumns', $attr, 'div');

      var go = function() {

        var containerWidth = $element.innerWidth();
        var childWidth = 0;

        var children = $element.children(selector);

        // find the biggest child, though really they should all be the same size...
        children.each(function(child) {
          var self = $(this);
          if (!self.is(':visible')) {
            return;
          }
          if (self.outerWidth() > childWidth) {
            childWidth = self.outerWidth();
          }
        });

        if (childWidth === 0) {
          return;
        }

        var columns = Math.floor(containerWidth / childWidth);
        var margin = (containerWidth - (columns * childWidth)) / columns / 2;
        /*
        log.debug("child width: ", childWidth);
        log.debug("Inner width: ", containerWidth);
        log.debug("columns: ", columns);
        log.debug("margin: ", margin);
        */

        children.each(function(child) {
          $(this).css({
            'margin-left': margin,
            'margin-right': margin
          });
        });

      };

      //$scope.$watch(go);
      setTimeout(go, 300);
      $(window).resize(go);

    };

  }

}
