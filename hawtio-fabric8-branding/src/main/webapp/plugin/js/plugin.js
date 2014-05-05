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
    self.log.debug("Adding fabric8 theme");
    Themes.definitions['fabric8'] = {
      label: 'fabric8',
      file: self.context + 'plugin/css/fabric8.css',
      loginBg: self.context + 'plugin/img/fabric8-login.svg'
    };
    var localStorage = Core.getLocalStorage();
    if (!('theme' in localStorage)) {
      localStorage['theme'] = 'fabric8';
    }
    task();
  });

  self.enablefabric8 = function(branding) {
    if (branding.exclusiveSet) {
      return;
    }
    self.log.info("enabled fabric8 branding");
    branding.appName = 'fabric8 console';
    branding.appLogo = self.context + '/plugin/img/logo.png';

    branding.fullscreenLogin = true;
    branding.enabled = true;
  };

  self.module = angular.module(self.pluginName, ['hawtioCore']);

  self.module.run(function (branding) {
    self.enablefabric8(branding);
  });

  hawtioPluginLoader.addModule(self.pluginName);
  return self;
})(fabric8Branding || {});

