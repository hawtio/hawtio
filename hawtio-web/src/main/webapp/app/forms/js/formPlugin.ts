module Forms {

  export var pluginName = 'hawtio-forms';
  var log:Logging.Logger = Logger.get("Forms");

  angular.module(Forms.pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'datatable', 'ui.bootstrap', 'ui.bootstrap.dialog', 'hawtio-ui']).
    config(($routeProvider) => {
      $routeProvider.
        when('/forms/test', {templateUrl: 'app/forms/html/test.html'}).
        when('/forms/testTable', {templateUrl: 'app/forms/html/testTable.html'});
    }).
    // TODO - rename this to hawtio-form or something
    directive('simpleForm',function (workspace, $compile) {
      return new Forms.SimpleForm(workspace, $compile);
    }).
    directive('hawtioInputTable',function (workspace, $compile) {
      return new Forms.InputTable(workspace, $compile);
    }).
    directive('hawtioFormText',function (workspace, $compile) {
      return new Forms.TextInput(workspace, $compile);
    }).
    directive('hawtioFormPassword',function (workspace, $compile) {
      return new Forms.PasswordInput(workspace, $compile);
    }).
    directive('hawtioFormHidden',function (workspace, $compile) {
      return new Forms.HiddenText(workspace, $compile);
    }).
    directive('hawtioFormNumber',function (workspace, $compile) {
      return new Forms.NumberInput(workspace, $compile);
    }).
    directive('hawtioFormSelect',function (workspace, $compile) {
      return new Forms.SelectInput(workspace, $compile);
    }).
    directive('hawtioFormArray',function (workspace, $compile) {
      return new Forms.ArrayInput(workspace, $compile);
    }).
    directive('hawtioFormStringArray',function (workspace, $compile) {
      return new Forms.StringArrayInput(workspace, $compile);
    }).
    directive('hawtioFormCheckbox',function (workspace, $compile) {
      return new Forms.BooleanInput(workspace, $compile);
    }).
    directive('hawtioFormCustom',function (workspace, $compile) {
      return new Forms.CustomInput(workspace, $compile);
    }).
    directive('hawtioSubmit',function () {
      return new Forms.SubmitForm();
    }).
    directive('hawtioReset',function () {
      return new Forms.ResetForm();
    }).
    // autofill directive handles autofill input fields generating proper events in anguarjs
    // see: http://stackoverflow.com/questions/14965968/angularjs-browser-autofill-workaround-by-using-a-directive/16800988#16800988
    directive('autofill', ['$timeout', function ($timeout) {
      return {
        scope: true,
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
          function fireInput() {
            // try both approaches just in case one doesn't work ;)
            elem.trigger('input');
            if (elem.length) {
              $(elem[0]).trigger('input');
            }
          }

          // lets try a couple of times just to be sure; as sometimes the event is fired too soon
          $timeout(fireInput, 200);
          $timeout(fireInput, 800);
          $timeout(fireInput, 1500);
        }
      }
    }]).
    run(function (helpRegistry) {
      helpRegistry.addDevDoc("forms", 'app/forms/doc/developer.md');
    });


  hawtioPluginLoader.addModule(pluginName);
}
