/**
 * @module Core
 */
module Core {

  /**
   * Ensure whatever value is passed in is converted to a boolean
   * Added here because it's needed for the below stuff...
   * @method
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
 * @module Branding
 */
module Branding {

  export var enabled = false;
  export var profile = null;

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
      var link = $("<link>");
      $("head").append(link);

      link.attr({
        rel: 'stylesheet',
        type: 'text/css',
        href: 'css/site-branding.css'
      });
    }

  });

  export var pluginName = 'hawtio-branding';

  export var propertiesToCheck = ['karaf.version'];
  export var wantedStrings = ['redhat', 'fuse'];

  angular.module(pluginName, ['hawtioCore']).
      run(($http, helpRegistry, branding) => {

        helpRegistry.addDevDoc("branding", 'app/branding/doc/developer.md');

        if (Branding.enabled) {
          console.log("enabled branding");
          branding.appName = 'Management Console';
          branding.appLogo = 'img/branding/RHJB_Fuse_UXlogotype_0513LL_white.svg';
          branding.loginBg = 'img/branding/login-screen-background.jpg';
          branding.fullscreenLogin = true;
          branding.profile = Branding.profile;

          if (Branding.mqProfiles.any(branding.profile)) {
            branding.appLogo = 'img/branding/RH_JBoss_AMQ_logotype_interface_LL_white.svg';
          }
        }

      });

  hawtioPluginLoader.addModule(pluginName);

}
