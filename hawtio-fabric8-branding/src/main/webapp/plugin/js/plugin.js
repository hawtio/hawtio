/**
 * The fabric8 hawtio theme
 *
 * @module fabric8Branding
 * @main fabric8
 */
var fabric8Branding = (function (self) {

  self.log = Logger.get("fabric8");
  self.context = '../fabric8-branding/';
  self.pluginName = 'hawtio-fabric8-branding';

  hawtioPluginLoader.registerPreBootstrapTask(function (task) {
    Themes.definitions['fabric8'] = {
      label: 'fabric8',
      file: self.context + 'plugin/css/fabric8.css',
      loginBg: self.context + 'plugin/img/fabric8-login.svg'
    };
    var localStorage = Core.getLocalStorage();
    if (!('theme' in localStorage)) {
      localStorage['theme'] = 'fabric8';
    }
    Themes.brandings['fabric8'] = {
      label: 'fabric8',
      setFunc: function(branding) {
        branding.appName = 'fabric8 console';
        branding.appLogo = self.context + '/plugin/img/fabric8_icon.svg';
        branding.logoOnly = false;
        branding.fullscreenLogin = true;
        branding.css = self.context + 'plugin/css/branding.css';
        branding.favicon = self.context + 'plugin/img/favicon.ico';
        return branding;
      }
    }
    if (!('branding' in localStorage)) {
      localStorage['branding'] = 'fabric8';
    }
    task();
  });

  self.module = angular.module(self.pluginName, ['hawtioCore']);
  self.module.run(function (branding) {
    self.log.debug("theme loaded");
  });

  hawtioPluginLoader.addModule(self.pluginName);
  return self;
})(fabric8Branding || {});

