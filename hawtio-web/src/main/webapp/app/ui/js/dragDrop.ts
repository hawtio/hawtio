///<reference path="uiPlugin.ts"/>

module UI {

  export var hawtioDrag = _module.directive("hawtioDrag", [() => {
    return {
      replace: false,
      transclude: true,
      restrict: 'A',
      template: '<span ng-transclude></span>',
      scope: {
        data: '=hawtioDrag'
      },
      link: (scope, element, attrs) => {
        log.debug("hawtioDrag, data: ", scope.data);
        var el = element[0];
        el.draggable = true;
        el.addEventListener('dragstart', (event:DragEvent) => {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('data', scope.data);
          element.addClass('drag-started');
          return false;
        }, false);

        el.addEventListener('dragend', (event:DragEvent) => {
          element.removeClass('drag-started');
        }, false);
      }
    }
  }]);

  export var hawtioDrop = _module.directive("hawtioDrop", [() => {
    return {
      replace: false,
      transclude: true,
      restrict: 'A',
      template: '<span ng-transclude></span>',
      scope: {
        onDrop: '&?hawtioDrop',
        ngModel: '=',
        property: '@',
        prefix: '@'
      },
      link: (scope, element, attrs) => {
        log.debug("hawtioDrop, onDrop: ", scope.onDrop);
        log.debug("hawtioDrop, ngModel: ", scope.ngModel);
        log.debug("hawtioDrop, property: ", scope.property);

        var dragEnter = (event:DragEvent) => {
          if (event.preventDefault) {
            event.preventDefault();
          }
          element.addClass('drag-over');
          return false;
        };

        var el = element[0];
        el.addEventListener('dragenter', dragEnter, false);
        el.addEventListener('dragover', dragEnter, false);
        el.addEventListener('dragleave', (event:DragEvent) => {
          element.removeClass('drag-over');
          return false;
        }, false);
        el.addEventListener('drop', (event:DragEvent) => {
          if (event.stopPropagation) {
            event.stopPropagation();
          }
          element.removeClass('drag-over');
          var data = event.dataTransfer.getData('data');
          if (scope.onDrop) {
            scope.$eval(scope.onDrop, {
              data: data,
              model: scope.ngModel,
              property: scope.property
            });
          }
          var eventName = 'hawtio-drop';
          if (!Core.isBlank(scope.prefix)) {
            eventName = scope.prefix + '-' + eventName;
          }
          // let's emit this too so parent scopes can watch for the data
          scope.$emit(eventName, {
            data: data,
            model: scope.ngModel,
            property: scope.property
          });
          Core.$apply(scope);
          return false;
        }, false);
      }
    }
  }]);

}
