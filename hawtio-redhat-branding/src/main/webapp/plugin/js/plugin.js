/**
 * The Red Hat hawtio theme
 *
 * @module Branding
 * @main Branding
 */
var Branding = (function (Branding) {
  Branding.enabled = null;
  Branding.profile = null;
  Branding.log = Logger.get("Branding");

  Branding.context = '/branding';

  // just in case we'll check for all of these...
  Branding.mqProfiles = ["mq-amq", "mq-default", "mq", "a-mq", "a-mq-openshift", "mq-replicated"];

  hawtioPluginLoader.registerPreBootstrapTask(function (task) {
    $.get('/branding/enabled/', function (response) {
      Branding.log.debug("Got response: ", response);
      Branding.enabled = Core.parseBooleanValue(response.enable);

      if (Branding.enabled) {
        Branding.profile = response.profile;
        Themes.definitions['Red Hat'] = {
          label: 'Red Hat',
          file: Branding.context + '/plugin/css/site-branding.css'
        };
        Themes.current = 'Red Hat';
      }
      task();
    });
  });

  Branding.pluginName = 'hawtio-branding';

  Branding.propertiesToCheck = ['karaf.version'];
  Branding.wantedStrings = ['redhat', 'fuse'];

  function enableBranding(branding) {
    Branding.log.info("enabled branding");
    branding.appName = 'Management Console';
    branding.appLogo = Branding.context + '/plugin/img/RHJB_Fuse_UXlogotype_0513LL_white.svg';
    branding.loginBg = Branding.context + '/plugin/img/login-screen-background.jpg';
    branding.fullscreenLogin = true;
    branding.profile = Branding.profile;
    branding.isAMQ = false;
    branding.enabled = true;

    if (branding.profile) {
      Branding.mqProfiles.forEach(function (profile) {
        if (!branding.isAMQ && branding.profile.has(profile)) {
          branding.isAMQ = true;
          branding.appLogo = Branding.context + '/plugin/img/RH_JBoss_AMQ_logotype_interface_LL_white.svg';
        }
      });
    }

    Branding.log.debug("Branding: ", branding);
  }
  Branding.enableBranding = enableBranding;

  angular.module(Branding.pluginName, ['hawtioCore']).run(function (helpRegistry, branding, $rootScope) {
    helpRegistry.addDevDoc("branding", Branding.context + '/plugin/doc/developer.md');

    if (Branding.enabled !== null) {
      Branding.log.debug("Branding.enabled set: ", Branding.enabled);
      if (Branding.enabled) {
        enableBranding(branding);
      }
    } else {
      setTimeout(function () {
        Branding.log.debug("Branding.enabled not yet set: ", Branding.enabled);
        if (Branding.enabled) {
          enableBranding(branding);
          Core.$apply($rootScope);
        }
      }, 500);
    }
  });

  hawtioPluginLoader.addModule(Branding.pluginName);
  return Branding;

})(Branding || {});

