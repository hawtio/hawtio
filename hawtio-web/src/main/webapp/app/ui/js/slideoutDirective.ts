/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  _module.directive('hawtioSlideout', () => {
    return new UI.SlideOut();
  });

  export class SlideOut {
    public restrict = 'A';
    public replace = true;
    public transclude = true;
    public templateUrl = UI.templatePath + 'slideout.html';

    public scope = {
      show: '=hawtioSlideout',
      direction: '@',
      top: '@',
      height: '@',
      title: '@'
    };

    public controller = ["$scope", "$element", "$attrs", "$transclude", "$compile", ($scope, $element, $attrs, $transclude, $compile) => {
      $scope.clone = null;

      $transclude(function(clone) {
        $scope.clone = $(clone).filter('.dialog-body');
      });

      observe($scope, $attrs, 'direction', 'right');
      observe($scope, $attrs, 'top', '10%', function(value) {
        $element.css('top', value);
      });
      observe($scope, $attrs, 'height', '80%', function(value) {
        $element.css('height', value);
      });
      observe($scope, $attrs, 'title', '');

      $scope.$watch('show', function() {
        if ($scope.show) {
          $scope.body = $element.find('.slideout-body');
          $scope.body.html($compile($scope.clone.html())($scope.$parent));
        }
      });

      $scope.hidePanel = ($event) => {
        log.debug("Event: ", $event);
        $scope.show = false;

      };
    }];

    public link = ($scope, $element, $attrs) => {
      $scope.$watch('show', function() {
        if ($scope.show) {
          $element.addClass('out');
          $element.focus();
        } else {
          $element.removeClass('out');
        }
      });
    };



  }

}
