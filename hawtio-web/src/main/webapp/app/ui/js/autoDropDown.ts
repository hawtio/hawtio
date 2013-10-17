module UI {

  // expand the element to accomodate a group of elements to prevent them from wrapping
  export var AutoDropDown = {
    restrict: 'A',
    link: ($scope, $element, $attrs) => {


      function locateElements (event) {
        var el = $element.get(0);
        if (event && event.relatedNode !== el && event.type) {
          if (event && event.type !== 'resize') {
            return;
          }
        }

        var overflowEl = $($element.find('.overflow'));
        var overflowMenu = $(overflowEl.find('ul.dropdown-menu'));
        var availableWidth = $element.innerWidth() - ($element.innerWidth() - overflowEl.offset().left);

        $element.children('li').each(function(index) {
          var self = $(this);
          var cssClass = self.attr('class')
          if ( (cssClass && cssClass.has("overflow")) || self.css('display') === 'none') {
            return;
          }

          availableWidth = availableWidth - self.outerWidth();
          if (availableWidth < 0) {
            self.detach();
            overflowMenu.append(self);
          }
        });

        if (overflowMenu.children().length > 0) {
          overflowEl.css({visibility: "visible"});
        }

        if (availableWidth > 130) {
          overflowMenu.children('li').each(function(index) {
            var self = $(this);
            var cssClass = self.attr('class')
            if ((cssClass && cssClass.has("overflow")) || self.css('display') === 'none') {
              return;
            }

            if (availableWidth > self.outerWidth()) {
              availableWidth = availableWidth - self.outerWidth();
              self.detach();
              $element.append(self);
            }
          });
        }

        if (overflowMenu.children().length === 0) {
          overflowEl.css({visibility: "hidden"});
        }

      }


      $(window).resize(locateElements);
      $element.get(0).addEventListener("DOMNodeInserted", locateElements);
      $scope.$watch(setTimeout(locateElements, 500));

    }
  };

}
