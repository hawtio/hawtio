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
        width: '@',
        header: '@'
      },
      controller: ($scope, $element, $attrs, $transclude, $document, $timeout, $compile, $templateCache) => {

        $scope.moving = false;

        $transclude((clone) => {

          $element.find(".pane-content").append(clone);

          if (Core.isBlank($scope.header)) {
            return;
          }

          var headerTemplate = $templateCache.get($scope.header);

          var wrapper = $element.find(".pane-header-wrapper");
          wrapper.html($compile(headerTemplate)($scope));
          $timeout(() => {
            $element.find(".pane-viewport").css("top", wrapper.height());
          }, 500);
        });

        $scope.setWidth = (width) => {
          if (width < 6) {
            return;
          }
          $element.width(width);
          $element.parent().css($scope.padding, $element.width() + "px");
        };


        $scope.open = () => {
          $scope.setWidth($scope.width);
        }

        $scope.close = () => {
          $scope.width = $element.width();
          $scope.setWidth(6);
        }

        $scope.$on('pane.close', $scope.close);
        $scope.$on('pane.open', $scope.open);

        $scope.toggle = () => {
          if ($scope.moving) {
            return;
          }
          if ($element.width() > 6) {
            $scope.close();
          } else {
            $scope.open();
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

