module Forms {

  export var pluginName = 'hawtio-forms';

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
          directive('hawtioInputTable', function (workspace, $compile) {
            return new Forms.InputTable(workspace, $compile);
          }).
          directive('hawtioFormText', function (workspace, $compile) {
            return new Forms.TextInput(workspace, $compile);
          }).
          directive('hawtioFormPassword', function (workspace, $compile) {
            return new Forms.PasswordInput(workspace, $compile);
          }).
          directive('hawtioFormHidden', function (workspace, $compile) {
            return new Forms.HiddenText(workspace, $compile);
          }).
          directive('hawtioFormNumber', function (workspace, $compile) {
            return new Forms.NumberInput(workspace, $compile);
          }).
          directive('hawtioFormSelect', function (workspace, $compile) {
            return new Forms.SelectInput(workspace, $compile);
          }).
          directive('hawtioFormArray', function(workspace, $compile) {
            return new Forms.ArrayInput(workspace, $compile);
          }).
          directive('hawtioFormCheckbox', function(workspace, $compile) {
            return new Forms.BooleanInput(workspace, $compile);
          }).
          directive('hawtioFormCustom', function(workspace, $compile) {
            return new Forms.CustomInput(workspace, $compile);
          }).
          directive('hawtioSubmit', function() {
            return new Forms.SubmitForm();
          }).
          directive('hawtioReset', function() {
            return new Forms.ResetForm();
          });


  hawtioPluginLoader.addModule(pluginName);
}
