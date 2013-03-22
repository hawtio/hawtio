module Forms {

  export var pluginName = 'hawtio-forms';

  angular.module(Forms.pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
      config(($routeProvider) => {
        $routeProvider.when('/forms/test', {templateUrl: 'app/forms/html/test.html'});
      }).
      directive('simpleForm', Forms.SimpleForm);

  hawtioPluginLoader.addModule(pluginName);
}
