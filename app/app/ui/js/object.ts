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

        function interpolate(template, key, value) {
          var interpolateFunc = $interpolate(template);
          if (!key) {
            return interpolateFunc({
              data: value
            });
          } else {
            return interpolateFunc({
              key: key.titleize(),
              data: value
            });
          }
        }

        function compile(template, key, value) {
          var interpolated = interpolate(template, key, value);
          var scope = $scope.$new();
          scope.data = value;
          return $compile(interpolated)(scope);
        }

        function renderPrimitiveValue(entity) {
          var template = $templateCache.get('primitiveValueTemplate.html');
          return compile(template, undefined, entity);
        }

        function renderObjectValue(entity) {
          var isArray = false;
          var el = undefined;
          angular.forEach(entity, (value, key) => {
            if (angular.isNumber(key) && "length" in entity) {
              isArray = true;
            }
            if (isArray) {
              return;
            }
            if (key.startsWith("$")) {
              return;
            }
            if (!el) {
              el = angular.element('<span></span>');
            }
            if (angular.isArray(value)) {
              el.append(renderArrayAttribute(key, value));
            } else if (angular.isObject(value)) {
              if (Object.extended(value).size() === 0) {
                el.append(renderPrimitiveAttribute(key, 'empty'));
              } else {
                el.append(renderObjectAttribute(key, value));
              }
            } else {
              el.append(renderPrimitiveAttribute(key, value));
            }
          });
          if (el) {
            return el.children();
          } else {
            return el;
          }
        }

        function getColumnHeaders(entity:Array<any>) {
          var answer = <Array<string>> undefined;
          if (!entity) {
            return answer;
          }
          var hasPrimitive = false;
          entity.forEach((item) => {
            if (!hasPrimitive && angular.isObject(item)) {
              if (!answer) {
                answer = [];
              }
              answer = Object.extended(item).keys().union(answer);
            } else {
              answer = <Array<string>> undefined;
              hasPrimitive = true;
            }
          });
          if (answer) {
            answer = <Array<string>> answer.exclude((item) => { return ("" + item).startsWith('$'); });
          }
          //log.debug("Column headers: ", answer);
          return answer;
        }

        function renderTable(template, key, value, headers) {
          var el = angular.element(interpolate(template, key, value));
          var thead = el.find('thead');
          var tbody = el.find('tbody');

          var headerTemplate = $templateCache.get('headerTemplate.html');
          var cellTemplate = $templateCache.get('cellTemplate.html');
          var rowTemplate = $templateCache.get('rowTemplate.html');
          var headerRow = angular.element(rowTemplate);

          headers.forEach((header) => {
            headerRow.append(interpolate(headerTemplate, header, undefined));
          });
          thead.append(headerRow);
          value.forEach((item) => {
            var tr = angular.element(rowTemplate);
            headers.forEach((header) => {
              var td = angular.element(cellTemplate);
              td.append(renderThing(item[header]));
              tr.append(td);
            });
            tbody.append(tr);
          });
          return el;
        }

        function renderArrayValue(entity):any {
          var headers = getColumnHeaders(entity);
          if (!headers) {
            var template = $templateCache.get('arrayValueListTemplate.html');
            return compile(template, undefined, entity);
          } else {
            var template = $templateCache.get('arrayValueTableTemplate.html');
            return renderTable(template, undefined, entity, headers);
          }
        }

        function renderPrimitiveAttribute(key, value) {
          var template = $templateCache.get('primitiveAttributeTemplate.html');
          return compile(template, key, value);
        }

        function renderObjectAttribute(key, value) {
          var template = $templateCache.get('objectAttributeTemplate.html');
          return compile(template, key, value);
        }

        function renderArrayAttribute(key, value):any {
          var headers = getColumnHeaders(value);
          if (!headers) {
            var template = $templateCache.get('arrayAttributeListTemplate.html');
            return compile(template, key, value);
          } else {
            var template = $templateCache.get('arrayAttributeTableTemplate.html');
            return renderTable(template, key, value, headers);
          }
        }

        function renderThing(entity) {
          if (angular.isArray(entity)) {
            return renderArrayValue(entity);
          } else if (angular.isObject(entity)) {
            return renderObjectValue(entity);
          } else {
            return renderPrimitiveValue(entity);
          }
        }

        $scope.$watch('entity', (entity) => {
          //log.debug("entity: ", $scope.entity);
          if (!entity) {
            $element.empty();
            return;
          }
          $element.html(renderThing(entity));
        }, true);
      }
    };
  }]);

}
