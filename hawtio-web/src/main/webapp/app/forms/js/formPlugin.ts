module Forms {

  export var pluginName = 'hawtio-forms';

  angular.module(Forms.pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
      config(($routeProvider) => {
        $routeProvider.when('/forms/test', {templateUrl: 'app/forms/html/test.html'});
      }).
      directive('simpleForm', function(workspace, $compile) {
        return new Forms.SimpleForm(workspace, $compile);
      }).
      directive('simpleReadOnlyForm', function(workspace, $compile) {
        return new Forms.SimpleReadOnlyForm(workspace, $compile);
      });

  hawtioPluginLoader.addModule(pluginName);
}
