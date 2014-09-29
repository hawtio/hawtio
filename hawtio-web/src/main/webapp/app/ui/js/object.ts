/// <reference path="uiPlugin.ts"/>

module UI {

  var objectView = _module.directive("hawtioObject", ["$templateCache", "$interpolate", "$compile", ($templateCache:ng.ITemplateCacheService, $interpolate:ng.IInterpolateService, $compile:ng.ICompileService) => {
    return {
      restrict: "A",
      replace: true,
      templateUrl: templatePath + "object.html",
      scope: {
        "entity": "=?hawtioObject",
        "config": "=?"
      },
      link: ($scope, $element, $attr) => {
        $scope.$watch('entity', (entity) => {
          if (entity) {
            angular.forEach(entity, (value, key) => {
              if (key.startsWith("$")) {
                return;
              }
              var template = $templateCache.get('itemTemplate.html');
              if (angular.isObject(value)) {
                template = $templateCache.get('objectTemplate.html');
              }
              var interpolated = $interpolate(template);
              var el = interpolated({
                key: key.titleize() + ":",
                data: value
              });
              if (angular.isObject(value)) {
                var scope = $scope.$new();
                scope.data = value;
                $element.append($compile(el)(scope));

              } else {
                $element.append(el);
              }
            });
          } else {
            $element.empty();
          }
          log.debug("entity: ", $scope.entity);

        }, true);
      }
    };
  }]);

}
