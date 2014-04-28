/**
 * @module Themes
 * @main Themes
 */
module Themes {

  export var definitions = {
    'Default': {
      label: 'Default',
      file: 'app/themes/css/default.css',
      loginBg: 'app/themes/img/default/fire.jpg'
    },
    'Dark': {
      label: 'Dark',
      file: 'app/themes/css/dark.css',
      loginBg: 'app/themes/img/default/fire.jpg'
    }
  };

  export var current = 'Default';

  export function getAvailable() {
    return Object.extended(Themes.definitions).keys();
  }

  export function setTheme(name, branding) {
    if (!(name in Themes.definitions)) {
      name = 'Default';
      log.info("unknown theme name, using default theme");
    }
    var theme = Core.pathGet(Themes.definitions, [name]);
    Themes.applyTheme(theme, branding);
    Themes.current = name;
    localStorage['theme'] = Themes.current;
  }

  export function applyTheme(theme, branding) {
    var cssEl = $("#theme");
    cssEl.prop("disabled", true);
    if (!theme || !theme['file'] || !theme['label']) {
      log.info("invalid theme, setting theme to Default");
      cssEl.attr({href: definitions['Default']['file']});
      branding.loginBg = definitions['Default']['loginBg'];
    } else {
      log.debug("Setting theme to ", theme['label']);
      cssEl.attr({href: theme['file']});
      if (theme['loginBg']) {
        branding.loginBg = theme['loginBg'];
      }
    }
    cssEl.prop("disabled", false);
  }

  export var pluginName = "themes";
  export var log:Logging.Logger = Logger.get("Themes");
  export var _module = angular.module(pluginName, ["hawtioCore"]);

  _module.run((localStorage, branding, preferencesRegistry) => {
    var themeName = localStorage['theme'];
    Themes.setTheme(themeName, branding);
    preferencesRegistry.addTab("Theme", "app/themes/html/preferences.html");
    log.debug("Loaded");
  });

  hawtioPluginLoader.addModule(pluginName);

}
