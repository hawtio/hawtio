module Branding {

  export var pluginName = 'hawtio-branding';

  export var propertiesToCheck = ['karaf.version'];
  export var wantedStrings = ['redhat', 'fuse'];

  angular.module(pluginName, ['hawtioCore']).
      run(($http, helpRegistry) => {

        helpRegistry.addDevDoc("branding", 'app/branding/doc/developer.md');

        $http.get('/hawtio/branding').success((enabled) => {
          if (enabled) {
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

        }).error((data) => {
          console.log("not enabline branding");
        });

      });

  hawtioPluginLoader.addModule(pluginName);

}
