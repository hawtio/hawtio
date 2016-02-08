/// <reference path="formHelpers.ts"/>
/// <reference path="mappingRegistry.ts"/>
/// <reference path="formPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
module Forms {

  var mapDirective = _module.directive("hawtioFormMap", [() => {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: UrlHelpers.join(Forms.templateUrl, "formMapDirective.html"),
      scope: {
        description: '@',
        entity: '=',
        mode: '=',
        data: '=',
        name: '@'
      },
      link: (scope, element, attr) => {
        scope.deleteKey = (key) => {
          try {
            delete scope.entity[scope.name]["" + key];
          } catch (e) {
            log.debug("failed to delete key: ", key, " from entity: ", scope.entity);
            // nothing to do
          }
        }

        scope.addItem = (newItem) => {
          if (!scope.entity) {
            scope.entity = {};
          }
          Core.pathSet(scope.entity, [scope.name, newItem.key], newItem.value);
          scope.showForm = false;
        }

        scope.$watch('showForm', (newValue) => {
          if (newValue) {
            scope.newItem = {
              key: undefined,
              value: undefined
            };
          }
          // TODO actually look at the item type schema and use that for the 'value' parameter
        });

      }
    };
  }]);
}
