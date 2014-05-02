/**
 * The Red Hat hawtio theme
 *
 * @module Branding
 * @main Branding
 */
var RHBranding = (function (self) {
  self.enabled = null;
  self.profile = null;
  self.log = Logger.get("Branding");

  self.context = '/branding';

  // just in case we'll check for all of these...
  self.mqProfiles = ["mq-amq", "mq-default", "mq", "a-mq", "a-mq-openshift", "mq-replicated"];

  hawtioPluginLoader.registerPreBootstrapTask(function (task) {
    $.get('/branding/enabled/', function (response) {
      self.log.debug("Got response: ", response);
      self.enabled = Core.parseBooleanValue(response.enable);

      if (self.enabled) {
        self.profile = response.profile;
        Themes.definitions['Red Hat'] = {
          label: 'Red Hat',
          file: self.context + '/plugin/css/site-branding.css',
          loginBg: self.context + '/plugin/img/login-screen-background.jpg'
        };
        var localStorage = Core.getLocalStorage();
        if (!('theme' in localStorage)) {
          localStorage['theme'] = 'Red Hat';
        }
      }
      task();
    });
  });

  self.pluginName = 'hawtio-redhat-branding';

  self.propertiesToCheck = ['karaf.version'];
  self.wantedStrings = ['redhat', 'fuse'];

  self.enableBranding = function enableBranding(branding) {
    self.log.info("enabled branding");
    branding.exclusiveSet = true;
    branding.appName = 'Management Console';
    branding.appLogo = self.context + '/plugin/img/RHJB_Fuse_UXlogotype_0513LL_white.svg';

    branding.fullscreenLogin = true;
    branding.profile = self.profile;
    branding.isAMQ = false;
    branding.enabled = true;

    if (branding.profile) {
      self.mqProfiles.forEach(function (profile) {
        if (!branding.isAMQ && branding.profile.has(profile)) {
          branding.isAMQ = true;
          branding.appLogo = self.context + '/plugin/img/RH_JBoss_AMQ_logotype_interface_LL_white.svg';
        }
      });
    }
  }
  ;

  angular.module(self.pluginName, ['hawtioCore']).run(function (helpRegistry, branding, $rootScope) {
    helpRegistry.addDevDoc("branding", self.context + '/plugin/doc/developer.md');

    if (self.enabled !== null) {
      self.log.debug("Branding.enabled set: ", self.enabled);
      if (self.enabled) {
        self.enableBranding(branding);
      }
    } else {
      setTimeout(function () {
        self.log.debug("Branding.enabled not yet set: ", self.enabled);
        if (self.enabled) {
          self.enableBranding(branding);
          Core.$apply($rootScope);
        }
      }, 500);
    }
  });

  hawtioPluginLoader.addModule(self.pluginName);
  return self;

})(RHBranding || {});

