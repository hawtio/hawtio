module Forms {

  export var pluginName = 'hawtio-forms';

  angular.module(Forms.pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'datatable']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/forms/test', {templateUrl: 'app/forms/html/test.html'}).
                    when('/forms/testTable', {templateUrl: 'app/forms/html/testTable.html'});
          }).
          directive('simpleForm',function (workspace, $compile) {
            return new Forms.SimpleForm(workspace, $compile);
          }).
          directive('simpleReadOnlyForm',function (workspace, $compile) {
            return new Forms.SimpleReadOnlyForm(workspace, $compile);
          }).
          directive('inputTable', function (workspace, $compile) {
            return new Forms.InputTable(workspace, $compile);
          });

  hawtioPluginLoader.addModule(pluginName);
}
