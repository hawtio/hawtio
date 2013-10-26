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

        var template = $templateCache.get(contentTemplate);

        if (!template) {
          return;
        }

        (<any>$element).popover({
          title: title,
          trigger: trigger,
          html: html,
          content: $compile(template)($scope),
          delay: delay,
          placement: function(tip, element) {
            if (placement !== 'auto') {
              return placement;
            }
            var width = $document.innerWidth();
            var el = $(element);
            var elCenter = (<any>el.offset()).left + (el.outerWidth() / 2);
            var midpoint = width / 2;
            if (elCenter < midpoint) {
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
