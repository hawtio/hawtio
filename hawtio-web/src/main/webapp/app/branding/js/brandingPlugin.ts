/**
 * @module Core
 */
module Core {

  /**
   * Ensure whatever value is passed in is converted to a boolean
   *
   * In the branding module for now as it's needed before bootstrap
   *
   * @method parseBooleanValue
   * @for Core
   * @param {any} value
   * @return {Boolean}
   */
  export function parseBooleanValue(value):boolean {
    if (!angular.isDefined(value)) {
      return false;
    }

    if (value.constructor === Boolean) {
      return <boolean>value;
    }

    if (angular.isString(value)) {
      switch(value.toLowerCase()) {
        case "true":
        case "1":
        case "yes":
          return true;
        default:
          return false;
      }
    }

    if (angular.isNumber(value)) {
      return value !== 0;
    }

    throw new Error("Can't convert value " + value + " to boolean");

  }

}

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
      if ('createStyleSheet' in document) {
        // IE9
        document.createStyleSheet('css/site-branding.css');
      } else {
        // Everyone else
        var link = $("<link>");
        $("head").append(link);

        link.attr({
          rel: 'stylesheet',
          type: 'text/css',
          href: 'css/site-branding.css'
        });
      }
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
