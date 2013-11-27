/**
 * @module UI
 */
module UI {

  // expand the element to accomodate a group of elements to prevent them from wrapping
  export class DivRow {
    public restrict = 'A';

    public link = ($scope, $element, $attrs) => {

      $element.get(0).addEventListener("DOMNodeInserted", () => {
        var targets = $element.children();
        var width = 0;
        angular.forEach(targets, (target) => {
          var el = (<any>angular).element(target);
          switch(el.css('display')) {
            case 'none':
              break;
            default:
              width = width + el.outerWidth(true) + 5;
          }
        });
        $element.width(width);
      });

    };
  }

}
