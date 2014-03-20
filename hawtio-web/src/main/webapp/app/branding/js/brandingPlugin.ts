/**
 * The Red Hat hawtio theme
 *
 * @module Branding
 * @main Branding
 */
module Branding {

  export var enabled:boolean = null;
  export var profile = null;
  export var log:Logging.Logger = Logger.get("Branding");

  // just in case we'll check for all of these...
  export var mqProfiles = ["mq", "a-mq", "a-mq-openshift", "mq-replicated"];

  $.ajaxSetup({async:true});
  $.get('/hawtio/branding', (response) => {

    Branding.enabled = Core.parseBooleanValue(response.enable);

    // Branding.enabled = false;
    // Branding.enabled = true;

    if (Branding.enabled) {
      Branding.profile = response.profile;
      // pull in branding stylesheet
      Core.addCSS('css/site-branding.css');
    }

  });

  export var pluginName = 'hawtio-branding';

  export var propertiesToCheck = ['karaf.version'];
  export var wantedStrings = ['redhat', 'fuse'];

  export function enableBranding(branding) {
    Branding.log.info("enabled branding");
    branding.appName = 'Management Console';
    branding.appLogo = 'img/branding/RHJB_Fuse_UXlogotype_0513LL_white.svg';
    branding.loginBg = 'img/branding/login-screen-background.jpg';
    branding.fullscreenLogin = true;
    branding.profile = Branding.profile;

    if (Branding.mqProfiles.any(branding.profile)) {
      branding.appLogo = 'img/branding/RH_JBoss_AMQ_logotype_interface_LL_white.svg';
    }
  }

  angular.module(pluginName, ['hawtioCore']).
      run((helpRegistry, branding, $rootScope) => {

        helpRegistry.addDevDoc("branding", 'app/branding/doc/developer.md');

        // if our variable hasn't been initialized let's wait a few
        // milliseconds until it has been...
        if (Branding.enabled !== null) {
          Branding.log.debug("Branding.enabled set: ", Branding.enabled);
          if (Branding.enabled) {
            enableBranding(branding);
          }
        } else {
          setTimeout(() => {
            Branding.log.debug("Branding.enabled not yet set: ", Branding.enabled);
            if (Branding.enabled) {
              enableBranding(branding);
              Core.$apply($rootScope);
            }
          }, 500);
        }

      });

  hawtioPluginLoader.addModule(pluginName);

}
