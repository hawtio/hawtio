module Forms {

  export var pluginName = 'hawtio-forms';

  angular.module(Forms.pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'datatable', 'ui.bootstrap', 'ui.bootstrap.dialog']).
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
          directive('hawtioFormNumber', function (workspace, $compile) {
            return new Forms.NumberInput(workspace, $compile);
          }).
          directive('hawtioFormObject', function(workspace, $compile) {
            return new Forms.ObjectInput(workspace, $compile);
          });


  hawtioPluginLoader.addModule(pluginName);
}
