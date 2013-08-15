module UI {

  export var pluginName = 'hawtio-ui';

  export var templatePath = 'app/ui/html/';

  angular.module(UI.pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'ui', 'ui.bootstrap']).
      config( ($routeProvider) => {
        $routeProvider.
            when('/ui/test', {templateUrl: templatePath + 'test.html'})
      }).
      directive('hawtioConfirmDialog', function() {
        return new UI.ConfirmDialog();
      }).
      directive('hawtioSlideout', function() {
        return new UI.SlideOut();
      }).
      directive('hawtioPager', function() {
        return new UI.TablePager();
      }).
      directive('hawtioEditor', function() {
        return new UI.Editor();
      }).directive('hawtioColorPicker', function() {
        return new UI.ColorPicker()
      }).directive('hawtioFileUpload', () => {
        return new UI.FileUpload();
      }).directive('expandable', () => {
        return new UI.Expandable();
      }).directive('editableProperty', () => {
        return new UI.EditableProperty();
      }).run(function (helpRegistry) {
        helpRegistry.addDevDoc("ui", 'app/ui/doc/developer.md');
      });

  hawtioPluginLoader.addModule(pluginName);

}
