module Branding {

  export var enabled = false;

  $.get('/hawtio/branding', (enabled) => {
    Branding.enabled = enabled;

    // Branding.enabled = false;
    // Branding.enabled = true;

    if (Branding.enabled) {
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
        }

      });

  hawtioPluginLoader.addModule(pluginName);

}
