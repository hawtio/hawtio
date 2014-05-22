/**
 * @module UI
 */
module UI {

  export function hawtioPane() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: UI.templatePath + 'pane.html',
      scope: {
        position: '@',
        width: '@'
      },
      controller: ($scope, $element, $attrs, $transclude, $document) => {
        $transclude((clone) => {
          $element.find(".pane-content").append(clone);
        });

        $scope.startMoving = ($event) => {
          $event.stopPropagation();
          $event.preventDefault();
          $event.stopImmediatePropagation();

          $document.on("mouseup.hawtio-pane", ($event) => {
            $event.stopPropagation();
            $event.preventDefault();
            $event.stopImmediatePropagation();
            $document.off(".hawtio-pane");
            Core.$apply($scope);
          });

          $document.on("mousemove.hawtio-pane", ($event) => {
            $event.stopPropagation();
            $event.preventDefault();
            $event.stopImmediatePropagation();
            $element.width($event.pageX);
            $element.parent().css($scope.padding, $element.width() + "px");
            Core.$apply($scope);
          });
        }

      },
      link: ($scope, $element, $attr) => {

        var parent = $element.parent();

        var position = "left";
        if ($scope.position) {
          position = $scope.position;
        }
        $element.addClass(position);
        var width = $element.width();

        var padding = "padding-" + position;
        $scope.padding = padding;
        var original = parent.css(padding);
        parent.css(padding, width + "px");

        $scope.$on('$destroy', () => {
          parent.css(padding, original);
        });

      }
    }
  }

}

