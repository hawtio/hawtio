/**
 * @module UI
 */
module UI {


  export function TemplatePopover($templateCache, $compile, $document) {

    return {
      restrict:'A',
      link: ($scope, $element, $attr) => {

        var title = UI.getIfSet('title', $attr, undefined);
        var trigger = UI.getIfSet('trigger', $attr, 'hover');
        var html = true;
        var contentTemplate = UI.getIfSet('content', $attr, 'popoverTemplate');
        var placement = UI.getIfSet('placement', $attr, 'auto');
        var delay = UI.getIfSet('delay', $attr, '100');
        var container = UI.getIfSet('container', $attr, 'body');
        var selector = UI.getIfSet('selector', $attr, 'false');

        if (container === 'false') {
          container = false;
        }

        if (selector === 'false') {
          selector = false;
        }

        var template = $templateCache.get(contentTemplate);

        if (!template) {
          return;
        }

        $element.on('$destroy', () => {
          (<any>$element).popover('destroy');
        });

        (<any>$element).popover({
          title: title,
          trigger: trigger,
          html: html,
          content: () => $compile(template)($scope),
          delay: delay,
          container: container,
          selector: selector,
          placement: function(tip, element) {
            if (placement !== 'auto') {
              return placement;
            }

            var el = $element;
            var offset = el.offset();
            /* not sure on auto bottom/top

            var elVerticalCenter = offset['top'] + (el.outerHeight() / 2);
            if (elVerticalCenter < 300) {
              return 'bottom';
            }

            var height = window.innerHeight;
            if (elVerticalCenter > window.innerHeight - 300) {
              return 'top';
            }
            */

            var width = $document.innerWidth();
            var elHorizontalCenter = offset['left'] + (el.outerWidth() / 2);
            var midpoint = width / 2;
            if (elHorizontalCenter < midpoint) {
              return 'right';
            } else {
              return 'left';
            }
          }
        });
      }
    };
  }

}
