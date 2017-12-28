namespace ConsoleAssembly {

  const pluginName = 'hawtio-console-assembly';

  angular.module(pluginName, [])
    .run(refreshUserSessionWhenLocationChanges)
    .run(addLogoutToUserDropdown)
    .config(overrideAuthService);

  function refreshUserSessionWhenLocationChanges($rootScope, $http) {
    'ngInject';
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
  }

  function addLogoutToUserDropdown(HawtioExtension) {
    'ngInject';
    HawtioExtension.add('hawtio-user', ($scope) => {
      const a = document.createElement('a');
      a.setAttribute('href', 'auth/logout');
      a.setAttribute('target', '_self');
      a.textContent = 'Logout';
      const li = document.createElement('li');
      li.appendChild(a);
      return li;
    });
  }

  function overrideAuthService($provide) {
    'ngInject';
    $provide.decorator('authService', [
      '$delegate',
      function($delegate): Core.AuthService {
        return {
          logout(): void {
            window.location.href = 'auth/logout';
          }
        };
      }
    ]);
  }

  hawtioPluginLoader.addModule(pluginName);

}
