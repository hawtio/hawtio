/**
 * @module Themes
 * @main Themes
 */
module Themes {

  export var definitions = {
    'default': {
      label: 'Default',
      file: 'css/theme.css'
    },
    'dark': {
      label: 'Dark',
      file: 'app/themes/css/dark.css'
    }
  };

  export var current = 'default';

  export function getAvailable() {
    return Object.extended(Themes.definitions).keys();
  }

  export function setTheme(name) {
    if (!(name in Themes.definitions)) {
      name = 'default';
      log.info("unknown theme name, using default theme");
    }
    var theme = Core.pathGet(Themes.definitions, [name]);
    Themes.applyTheme(theme);
    Themes.current = name;
    localStorage['theme'] = Themes.current;
  }

  export function applyTheme(theme) {
    var cssEl = $("#theme");
    cssEl.prop("disabled", true);
    if (!theme || !theme['file'] || !theme['label']) {
      log.info("invalid theme, setting theme to Default");
      cssEl.attr({href: definitions.default['file']});
    } else {
      log.debug("Setting theme to ", theme['label']);
      cssEl.attr({href: theme['file']});
    }
    cssEl.prop("disabled", false);
  }

  export var pluginName = "themes";
  export var log:Logging.Logger = Logger.get("Themes");
  export var _module = angular.module(pluginName, []);

  _module.run(() => {
    log.debug("Loaded");
  });

  hawtioPluginLoader.registerPreBootstrapTask((task) => {
    var localStorage = Core.getLocalStorage();
    if (!('theme' in localStorage)) {
      localStorage['theme'] = Themes.current;
    }
    task();
  });

  hawtioPluginLoader.registerPreBootstrapTask((task) => {
    var themeName = Core.getLocalStorage()['theme'];
    Themes.setTheme(themeName);
    task();
  });

  hawtioPluginLoader.addModule(pluginName);

}
