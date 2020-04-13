/**
 * The main entry point for the Branding module
 */
var Branding = (function (Branding) {

  /**
   * The name of this plugin
   */
  Branding.pluginName = 'branding-plugin';

  /**
   * This plugin's logger instance
   */
  Branding.log = Logger.get('branding-plugin');

  /**
   * The top level path of this plugin on the server
   */
  Branding.contextPath = '/branding-plugin';

  /**
   * This plugin's AngularJS module instance.
   */
  Branding.module = angular.module(Branding.pluginName, [])
    .run(initPlugin);

  /**
   * Here you can overwrite hawtconfig.json by putting the JSON
   * data directly to configManager.config property.
   */
  function initPlugin(configManager) {
    configManager.config = {
      "branding": {
        "appName": "Hawtio Branding Example",
        "appLogoUrl": "img/hawtio-logo.svg",
        "companyLogoUrl": "img/hawtio-logo.svg",
        "css": `${Branding.contextPath}/app.css`,
        "favicon": `${Branding.contextPath}/img/favicon.ico`
      },
      "login": {
        "description": "This is placeholder text only. Use this area to place any information or introductory message about your application that may be relevant to users.",
        "links": [
          {
            "url": "#terms",
            "text": "Terms of use"
          },
          {
            "url": "#help",
            "text": "Help"
          },
          {
            "url": "#privacy",
            "text": "Privacy policy"
          }
        ]
      },
      "about": {
        "title": "Hawtio Branding Example",
        "productInfo": [],
        "additionalInfo": "",
        "copyright": "(c) 2019 Hawtio team",
        "imgSrc": "img/hawtio-logo.svg"
      },
      "disabledRoutes": []
    };

    // Calling this function is required to apply the custom css and
    // favicon settings
    Core.applyBranding(configManager);

    Branding.log.info(Branding.pluginName, "loaded");
  }
  initPlugin.$inject = ['configManager'];

  return Branding;

})(Branding || {});

// tell the Hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of AngularJS
hawtioPluginLoader.addModule(Branding.pluginName);
