/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  _module.directive('zeroClipboard', ["$parse", ($parse) => {
    return UI.ZeroClipboardDirective($parse);
  }]);

  export function ZeroClipboardDirective($parse) {
    return {
      restrict:'A',
      link: ($scope, $element, $attr) => {
        var clip = new (<any>window).ZeroClipboard($element.get(0), {
          moviePath: "img/ZeroClipboard.swf"
        });

        clip.on('complete', (client, args) => {

          if (args.text && angular.isString(args.text)) {
            Core.notification('info', "Copied text to clipboard: " + args.text.truncate(20));
          }
          Core.$apply($scope);
        });

        if ('useCallback' in $attr) {
          var func = $parse($attr['useCallback']);
          if (func) {
            func($scope, { clip: clip });
          }
        }
      }
    };
  }
}
