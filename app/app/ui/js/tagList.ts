/// <reference path="uiPlugin.ts"/>

module UI {
  export var hawtioTagList = _module.directive("hawtioTagList", ['$interpolate', '$compile', ($interpolate:ng.IInterpolateService, $compile:ng.ICompileService) => {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        ngModel: '=?',
        property: '@',
        onChange: '&'
      },
      link: (scope, $element, attr) => {

        if (!scope.ngModel || !scope.property || !scope.ngModel[scope.property]) {
          // bail out
          return;
        }

        scope.collection = scope.ngModel[scope.property];

        scope.removeTag = (tag) => {
          //log.debug("Removing: ", tag);
          scope.ngModel[scope.property].remove(tag);
          if (scope.onChange) {
            scope.$eval(scope.onChange);
          }
        };
        scope.$watch('collection', (newValue, oldValue) => {
          if (!scope.ngModel || !scope.property || !scope.ngModel[scope.property]) {
            // bail out
            return;
          }
          var tags = scope.ngModel[scope.property];
          //log.debug("Collection changed: ", tags);
          var tmp = angular.element("<div></div>");
          tags.forEach((tag) => {
            var func = $interpolate('<span class="badge badge-success mouse-pointer">{{tag}} <i class="icon-remove" ng-click="removeTag(\'{{tag}}\')"></i></span>&nbsp;');
            tmp.append(func({
              tag: tag
            }));
          });
          $element.html($compile(tmp.children())(scope));
        }, true);
      }
    }
  }]);
}
