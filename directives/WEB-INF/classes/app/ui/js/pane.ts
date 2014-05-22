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
      controller: ($scope, $element, $attrs, $transclude, $document, $timeout) => {

        $scope.moving = false;

        $transclude((clone) => {
          $element.find(".pane-content").append(clone);
        });

        $scope.setWidth = (width) => {
          if (width < 6) {
            return;
          }
          $element.width(width);
          $element.parent().css($scope.padding, $element.width() + "px");
        };

        $scope.toggle = () => {
          if ($scope.moving) {
            return;
          }
          if ($element.width() > 6) {
            $scope.width = $element.width();
            $scope.setWidth(6);
          } else {
            $scope.setWidth($scope.width);
          }
        };

        $scope.startMoving = ($event) => {
          $event.stopPropagation();
          $event.preventDefault();
          $event.stopImmediatePropagation();

          $document.on("mouseup.hawtio-pane", ($event) => {
            $timeout(() => {
              $scope.moving = false;
            }, 250);
            $event.stopPropagation();
            $event.preventDefault();
            $event.stopImmediatePropagation();
            $document.off(".hawtio-pane");
            Core.$apply($scope);
          });

          $document.on("mousemove.hawtio-pane", ($event) => {
            $scope.moving = true;
            $event.stopPropagation();
            $event.preventDefault();
            $event.stopImmediatePropagation();
            $scope.setWidth($event.pageX + 2);
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

