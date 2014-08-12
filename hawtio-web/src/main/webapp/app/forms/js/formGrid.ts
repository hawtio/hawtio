/// <reference path="formPlugin.ts"/>
/// <reference path="formInterfaces.ts"/>
module Forms {

  interface FormGridScope extends ng.IScope {
    configuration: Forms.FormGridConfiguration;
    removeThing: (index:number) => void;
    addThing: () => void;
    getHeading: () => String;
  }

  var formGrid = _module.directive("hawtioFormGrid", ['$templateCache', '$interpolate', '$compile', ($templateCache:ng.ITemplateCacheService, $interpolate:ng.IInterpolateService, $compile:ng.ICompileService) => {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        configuration: '=hawtioFormGrid'
      },
      templateUrl: Forms.templateUrl + 'formGrid.html',
      link: (scope:FormGridScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes) => {

        function createColumns() {
          return <Array<FormGridElement>> [];
        }

        function createColumnSequence() {
          var columns = createColumns();
          if (angular.isDefined(scope.configuration.rowSchema.columnOrder)) {
            var order = scope.configuration.rowSchema.columnOrder;
            order.forEach((column) => {
              var property = Core.pathGet(scope.configuration.rowSchema.properties, [column]);
              Core.pathSet(property, ['key'], column);
              columns.push(property);
            });
          }
          angular.forEach(scope.configuration.rowSchema.properties, (property, key) => {
            if (!columns.some((c:FormGridElement) => { return c.key === key })) {
              property.key = key;
              columns.push(property);
            }

          });
          //log.debug("Created columns: ", columns);
          return columns;
        }

        function newHeaderRow() {
          var header = element.find('thead');
          header.empty();
          return header.append($templateCache.get('rowTemplate.html')).find('tr');
        }

        function buildTableHeader(columns:Array<FormGridElement>) {
          var headerRow = newHeaderRow();
          // Build the table header
          columns.forEach((property) => {
            //log.debug("Adding heading for : ", property);
            var headingName = property.label || property.key;
            if (!scope.configuration.rowSchema.disableHumanizeLabel) {
              headingName = headingName.titleize();
            }
            var headerTemplate = property.headerTemplate || $templateCache.get('headerCellTemplate.html');
            var interpolateFunc = $interpolate(headerTemplate);
            headerRow.append(interpolateFunc({label: headingName}));
          });
          headerRow.append($templateCache.get("emptyHeaderCellTemplate.html"));
        }

        function clearBody() {
          var body = element.find('tbody');
          body.empty();
          return body;
        }

        function newBodyRow() {
          return angular.element($templateCache.get('rowTemplate.html'));
        }

        function buildTableBody(columns:Array<FormGridElement>, parent:ng.IAugmentedJQuery) {
          var rows = scope.configuration.rows;
          rows.forEach((row, index) => {
            var tr = newBodyRow();
            columns.forEach((property) => {
              var template = property.template || $templateCache.get('cellTemplate.html');
              var interpolateFunc = $interpolate(template);
              var type = Forms.mapType(property.type);
              tr.append(interpolateFunc({
                row: 'configuration.rows[' + index + ']',
                type: type,
                key: property.key
              }));
            });
            var func = $interpolate($templateCache.get("deleteRowTemplate.html"));
            tr.append(func({
              index: index
            }));
            parent.append(tr);
          });
        }

        scope.removeThing = (index:number) => {
          scope.configuration.rows.removeAt(index);
        };

        scope.addThing = () => {
          scope.configuration.rows.push(scope.configuration.onAdd());
        };

        scope.getHeading = ():String => {
          if (Core.isBlank(<string>scope.configuration.rowName)) {
            return 'items'.titleize();
          }
          return scope.configuration.rowName.pluralize().titleize();
        };

        scope.$watch('configuration.noDataTemplate', (newValue, oldValue) => {
          var noDataTemplate = scope.configuration.noDataTemplate || $templateCache.get('heroUnitTemplate.html');
          element.find('.nodata').html($compile(noDataTemplate)(scope));
        });

        scope.$watch('configuration.rowSchema', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            var columns = createColumnSequence();
            buildTableHeader(columns);
          }
        }, true);

        scope.$watchCollection('configuration.rows', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            var body = clearBody();
            var columns = createColumnSequence();
            // append all the rows to a temporary element so we can $compile in one go
            var tmp = angular.element('<div></div>');
            buildTableBody(columns, tmp);
            body.append($compile(tmp.children())(scope));
          }
        });

      }
    }
  }]);

}
