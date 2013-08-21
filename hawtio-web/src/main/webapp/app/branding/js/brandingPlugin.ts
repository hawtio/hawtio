module Branding {

  export var pluginName = 'hawtio-branding';

  export var propertiesToCheck = ['karaf.version'];
  export var wantedStrings = ['redhat', 'fuse'];

  angular.module(pluginName, ['hawtioCore']).
      run((jolokia, helpRegistry) => {

        jolokia.request({
          type: 'read',
          mbean: 'java.lang:type=Runtime',
          attribute: 'SystemProperties'
        }, {
          success: (response) => {

            if (response.value['hawtio.disableBranding']) {
              console.log("not enabling branding");
              return;
            }

            var found = false;

            var property = propertiesToCheck.find((property) => { return response.value[property]; });

            if (property) {
              found = wantedStrings.any((item) => {
                return response.value[property].has(item);
              });
            }

            if (found) {
              console.log("enabling branding");
              var link = $("<link>");
              $("head").append(link);

              link.attr({
                rel: 'stylesheet',
                type: 'text/css',
                href: 'css/site-branding.css'
              });

            } else {
              console.log("not enabling branding");
            }
          }
        });
        helpRegistry.addDevDoc("branding", 'app/branding/doc/developer.md');
      });

  hawtioPluginLoader.addModule(pluginName);

}
