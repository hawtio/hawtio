/**
 * The Red Hat hawtio theme
 *
 * @module RHBranding
 * @main RHBranding
 */
var RHBranding = (function (self) {

  self.log = Logger.get("RHBranding");
  self.context = '../redhat-branding/';
  self.pluginName = 'hawtio-redhat-branding';

  hawtioPluginLoader.registerPreBootstrapTask(function (task) {
    Themes.definitions['Red Hat'] = {
      label: 'Red Hat',
      file: self.context + 'plugin/css/redhat.css',
      loginBg: self.context + 'plugin/img/login-screen-background.jpg'
    };
    var localStorage = Core.getLocalStorage();
    if (!('theme' in localStorage)) {
      localStorage['theme'] = 'Red Hat';
    }
    Themes.brandings['Red Hat'] = {
      label: 'Red Hat',
      setFunc: function(branding) {
        branding.appName = 'Management Console';
        branding.appLogo = self.context + 'plugin/img/logo.svg';
        branding.css = self.context + 'plugin/css/branding.css';
        branding.fullscreenLogin = true;
        branding.logoOnly = false;
        return branding;
      }
    }
    if (!('branding' in localStorage)) {
      localStorage['branding'] = 'Red Hat';
    }
    task();
  });

  angular.module(self.pluginName, ['hawtioCore']).run(function () {
    self.log.info("Red Hat theme loaded"); 
  });

  hawtioPluginLoader.addModule(self.pluginName);
  return self;

})(RHBranding || {});

