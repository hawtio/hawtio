module UI {

  export var pluginName = 'hawtio-ui';

  export var templatePath = 'app/ui/html/';

  angular.module(UI.pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'ui', 'ui.bootstrap']).
      directive('hawtioConfirmDialog', function() {
        return new UI.ConfirmDialog();
      });



  hawtioPluginLoader.addModule(pluginName);

}
