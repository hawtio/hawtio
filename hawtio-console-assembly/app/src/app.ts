namespace ConsoleAssembly {

  const pluginName = 'hawtio-console-assembly';

  angular.module(pluginName, [])
    .run(refreshUserSessionWhenLocationChanges)
    .run(addLogoutToUserDropdown)
    .run(addPostLogoutTasks);

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
    HawtioExtension.add('hawtio-logout', ($scope) => {
      const a = document.createElement('a');
      a.setAttribute('href', 'auth/logout');
      a.setAttribute('target', '_self');
      a.textContent = 'Logout';
      return a;
    });
  }

  function addPostLogoutTasks(postLogoutTasks: Core.Tasks) {
    'ngInject';
    postLogoutTasks.addTask('redirectToLogout', () => window.location.href = 'auth/logout');
  }

  hawtioPluginLoader.addModule(pluginName);

}
