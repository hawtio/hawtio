/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
module Core {

  _module.directive('noClick', () => {
    return function($scope, $element, $attrs) {
      $element.click((event) => {
        event.preventDefault();
      });
    }
  });

  _module.directive('logToggler', ["localStorage", (localStorage) => {
    return {
      restrict: 'A',
      link: ($scope, $element, $attr) => {
        $element.click(() => {
          var log = $("#log-panel");
          var body = $('body');
          if (log.height() !== 0) {
            localStorage['showLog'] = 'false';
            log.css({'bottom': '110%'});
            body.css({
              'overflow-y': 'auto'
              });
          } else {
            localStorage['showLog'] = 'true';
            log.css({'bottom': '50%'});
            body.css({
              'overflow-y': 'hidden'
              });
          }
          return false;
        });
      }
    };
  }]);

  // autofill directive handles autofill input fields generating proper events in anguarjs
  // see: http://stackoverflow.com/questions/14965968/angularjs-browser-autofill-workaround-by-using-a-directive/16800988#16800988
  _module.directive('autofill', ['$timeout', function ($timeout) {
    return {
      restrict: "A",
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var ngModel = attrs["ngModel"];
        if (ngModel) {
          var log:Logging.Logger = Logger.get("Core");

          function checkForDifference() {
            // lets compare the current DOM node value with the model
            // in case we can default it ourselves
            var modelValue = scope.$eval(ngModel);
            var value = elem.val();
            if (value && !modelValue) {
              Core.pathSet(scope, ngModel, value);
              //log.info("autofill: Updated ngModel: " + ngModel + " original model value: " + modelValue + " UI value: " + value + " new value: " + scope.$eval(ngModel));
            } else {
              //log.info("Got invoked with ngModel: " + ngModel + " modelValue: " + modelValue + " value: " + value);

              // lets try trigger input/change events just in case
              // try both approaches just in case one doesn't work ;)
              elem.trigger('input');
              elem.trigger('change');
              if (elem.length) {
                var firstElem = $(elem[0]);
                firstElem.trigger('input');
                firstElem.trigger('change');
              }
            }
          }

          $timeout(checkForDifference, 200);
          $timeout(checkForDifference, 800);
          $timeout(checkForDifference, 1500);
        }
      }
    }
  }]);


}
