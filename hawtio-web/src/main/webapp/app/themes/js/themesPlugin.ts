/**
 * @module Themes
 * @main Themes
 */
module Themes {

  export var defaultLoginBg = 'app/themes/img/default/hawtio-nologo.jpg';

  export var definitions = {
    'Default': {
      label: 'Default',
      file: 'app/themes/css/default.css',
      loginBg: defaultLoginBg
    },
    'Dark': {
      label: 'Dark',
      file: 'app/themes/css/dark.css',
      loginBg: defaultLoginBg
    },
    '3270': {
      label: 'Dark',
      file: 'app/themes/css/3270.css',
      loginBg: defaultLoginBg
    }
  };

  export var brandings = {
    'hawtio': {
      label: 'hawtio',
      setFunc: (branding) => {
        branding.appName = 'hawtio';
        branding.appLogo = 'img/hawtio_logo.svg';
        branding.css = 'css/site-branding.css';
        branding.logoOnly = true;
        branding.fullscreenLogin = false;
        branding.favicon = 'favicon.ico';
        branding.welcomePageUrl = 'app/core/doc/welcome.md';
        branding.onWelcomePage = (data) => {
            return marked(data);
        };
        return branding;
      }
    },
    'Example': {
      label: 'Example',
      setFunc: (branding) => {
        branding.appName = 'Example';
        branding.appLogo = '';
        branding.logoOnly = false;
        branding.welcomePageUrl = 'app/themes/doc/welcome_example.md'; 
        return branding;
      }
    }

  }

  export var currentTheme = 'Default';
  export var currentBranding = 'hawtio';

  export function getAvailableThemes() {
    return Object.extended(Themes.definitions).keys();
  }

  export function getAvailableBrandings() {
    return Object.extended(Themes.brandings).keys();
  }

  function getBranding(name) {
    var b = Themes.brandings[name];
    if (!b || !b['setFunc']) {
      b = Themes.brandings['hawtio'];
    }
    return b;
  }

  function setCSS(el, file) {
    var cssEL = $(el);
    cssEL.prop("disabled", true);
    cssEL.attr({ href: file });
    cssEL.prop("disabled", false);
  }

  function setFavicon(file) {
    $('#favicon').remove();
    $('head').append('<link id="favicon" rel="icon" type="image/ico" href="' + file + '">"');
  }

  function applyTheme(theme, branding) {
    if (!theme || !theme['file'] || !theme['label']) {
      log.info("invalid theme, setting theme to Default");
      setCSS("#theme", definitions['Default']['file']);
      branding.loginBg = definitions['Default']['loginBg'];
    } else {
      log.debug("Setting theme to ", theme['label']);
      setCSS("#theme", theme['file']);
      if (theme['loginBg']) {
        branding.loginBg = theme['loginBg'];
      }
    }
  }

  export function setBranding(name, branding) {
    var b = getBranding(name);
    branding = b.setFunc(branding);
    log.debug("Set branding to: ", branding);
    if (branding.favicon) {
      setFavicon(branding.favicon);
    }
    if (branding.css) {
      setCSS("#branding", branding.css);
    }
    Themes.currentBranding = b['label'];
    localStorage['branding'] = Themes.currentBranding;
  }

  export function setTheme(name, branding) {
    if (!(name in Themes.definitions)) {
      name = 'Default';
      log.info("unknown theme name, using default theme");
    }
    var theme = Core.pathGet(Themes.definitions, [name]);
    applyTheme(theme, branding);
    Themes.currentTheme = name;
    localStorage['theme'] = Themes.currentTheme;
  }

  export var pluginName = "themes";
  export var log:Logging.Logger = Logger.get("Themes");
  export var _module = angular.module(pluginName, ["hawtioCore"]);

  _module.run(["localStorage", "branding", "preferencesRegistry", (localStorage, branding, preferencesRegistry) => {
    var themeName = localStorage['theme'];
    Themes.setTheme(themeName, branding);

    var brandingName = localStorage['branding'];
    Themes.setBranding(brandingName, branding);

    preferencesRegistry.addTab("Theme", "app/themes/html/preferences.html");
    log.debug("Loaded");
  }]);

  hawtioPluginLoader.addModule(pluginName);

}
