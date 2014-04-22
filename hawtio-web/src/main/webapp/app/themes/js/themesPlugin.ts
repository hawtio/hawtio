/**
 * @module Themes
 * @main Themes
 */
module Themes {

  export var definitions = {
    'Default': {
      label: 'Default',
      file: 'css/theme.css'
    },
    'Dark': {
      label: 'Dark',
      file: 'app/themes/css/dark.css'
    }
  };

  export var current = 'Default';

  export function getAvailable() {
    return Object.extended(Themes.definitions).keys();
  }

  export function setTheme(name) {
    if (!(name in Themes.definitions)) {
      name = 'Default';
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
      cssEl.attr({href: definitions['Default']['file']});
    } else {
      log.debug("Setting theme to ", theme['label']);
      cssEl.attr({href: theme['file']});
    }
    cssEl.prop("disabled", false);
  }

  export var pluginName = "themes";
  export var log:Logging.Logger = Logger.get("Themes");
  export var _module = angular.module(pluginName, ["hawtioCore"]);

  _module.run((localStorage) => {
    var themeName = localStorage['theme'];
    Themes.setTheme(themeName);
    log.debug("Loaded");
  });

  hawtioPluginLoader.registerPreBootstrapTask((task) => {
    var localStorage = Core.getLocalStorage();
    if (!('theme' in localStorage)) {
      localStorage['theme'] = Themes.current;
    }
    task();
  });

  hawtioPluginLoader.addModule(pluginName);

}
