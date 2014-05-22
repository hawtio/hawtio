/**
 * Module that contains a bunch of re-usable directives to assemble into pages in hawtio
 *
 * @module UI
 * @main UI
 */
module UI {

  export var pluginName = 'hawtio-ui';

  export var templatePath = 'app/ui/html/';

  angular.module(UI.pluginName, ['bootstrap', 'ngResource', 'ui', 'ui.bootstrap']).
    config(($routeProvider) => {
      $routeProvider.
        when('/ui/developerPage', {templateUrl: templatePath + 'developerPage.html', reloadOnSearch: false});
    }).factory('UI', () => {
      return UI;
    }).factory('marked', function () {
      marked.setOptions({
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: true,
        sanitize: false,
        smartLists: true,
        langPrefix: 'language-'
      });
      return marked;
    }).directive('hawtioConfirmDialog', function () {
      return new UI.ConfirmDialog();
    }).directive('hawtioSlideout', function () {
      return new UI.SlideOut();
    }).directive('hawtioPager', function () {
      return new UI.TablePager();
    }).directive('hawtioEditor', function ($parse) {
      return UI.Editor($parse);
    }).directive('hawtioColorPicker', function () {
      return new UI.ColorPicker()
    }).directive('expandable', () => {
      return new UI.Expandable();
    }).directive('gridster', () => {
      return new UI.GridsterDirective();
    }).directive('editableProperty', ($parse) => {
      return new UI.EditableProperty($parse);
    }).directive('hawtioViewport', () => {
      return new UI.ViewportHeight();
    }).directive('hawtioHorizontalViewport', () => {
      return new UI.HorizontalViewport();
    }).directive('hawtioRow', () => {
      return new UI.DivRow();
    }).directive('hawtioJsplumb', () => {
      return new UI.JSPlumb();
    }).directive('zeroClipboard', ($parse) => {
      return UI.ZeroClipboardDirective($parse);
    }).directive('hawtioAutoDropdown', () => {
      return UI.AutoDropDown;
    }).directive('hawtioMessagePanel', () => {
      return new UI.MessagePanel();
    }).directive('hawtioInfoPanel', () => {
      return new UI.InfoPanel();
    }).directive('hawtioAutoColumns', () => {
      return new UI.AutoColumns();
    }).directive('hawtioTemplatePopover', ($templateCache, $compile, $document) => {
      return UI.TemplatePopover($templateCache, $compile, $document);
    }).directive('hawtioTocDisplay', (marked, $location, $anchorScroll, $compile) => {
      return UI.HawtioTocDisplay(marked, $location, $anchorScroll, $compile);
    }).directive('hawtioDropDown', ($templateCache) => {
      return UI.hawtioDropDown($templateCache);
    }).directive('hawtioBreadcrumbs', () => {
      return UI.hawtioBreadcrumbs();
    }).directive('hawtioIcon', () => {
      return UI.hawtioIcon();
    }).directive('hawtioPane', () => {
      return UI.hawtioPane();
    }).directive('compile', ['$compile', ($compile) => {
      return (scope, element, attrs) => {
        scope.$watch(
          function (scope) {
            // watch the 'compile' expression for changes
            return scope.$eval(attrs.compile);
          },
          function (value) {
            // when the 'compile' expression changes
            // assign it into the current DOM
            element.html(value);

            // compile the new DOM and link it to the current
            // scope.
            // NOTE: we only compile .childNodes so that
            // we don't get into infinite loop compiling ourselves
            $compile(element.contents())(scope);
          }
        );
      };
    }]);

  hawtioPluginLoader.addModule(pluginName);

}
