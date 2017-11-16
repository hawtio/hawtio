namespace ConsoleAssembly {

  const pluginName = 'hawtio-console-assembly';

  angular.module(pluginName, [])
    .run(['$rootScope', '$http', 'HawtioExtension', function($rootScope, $http, HawtioExtension) {

      // Refresh user session every time a location changes
      $rootScope.$on('$locationChangeStart', ($event, newUrl, oldUrl) => {
        $http({
          method: 'post',
          url: 'refresh'
        }).then((response) => {
          console.debug("Updated session. Response: ", response);  
        }).catch((response) => {
          console.debug("Failed to update session expiry. Response: " + response);
        });
      });
      
      // Add 'Logout' to User dropdown
      HawtioExtension.add('hawtio-user', ($scope) => {
        const a = document.createElement('a');
        a.setAttribute('href', 'auth/logout');
        a.setAttribute('target', '_self');
        a.textContent = 'Logout';
        const li = document.createElement('li');
        li.appendChild(a);
        return li;
      });

    }]);

  hawtioPluginLoader.addModule(pluginName);
  
}
