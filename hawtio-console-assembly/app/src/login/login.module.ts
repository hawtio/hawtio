/// <reference path="./login.globals.ts"/>
/// <reference path="./login.controller.ts"/>
/// <reference path="./keycloak-login.ts"/>

namespace Login {

  const AUTH_LOGOUT_URL: string = 'auth/logout';

  angular
    .module(pluginName, [])
    .component('hawtioLogin', loginComponent)
    .run(addLogoutToUserDropdown)
    .run(addLogoutTask);

  export function addLogoutToUserDropdown(
    HawtioExtension: Core.HawtioExtension,
    $compile: ng.ICompileService,
    userDetails: Core.AuthService): void {
    'ngInject';

    HawtioExtension.add('hawtio-logout', ($scope) => {
      $scope.userDetails = userDetails;
      let template =
        '<a href="" ng-click="userDetails.logout()">Logout</a>';
      return $compile(template)($scope);
    });
  }

  function addLogoutTask(keycloakService: HawtioKeycloak.KeycloakService, postLogoutTasks: Core.Tasks,
    $window: ng.IWindowService): void {
    'ngInject';

    if (keycloakService.enabled) {
      // When Keycloak is enabled, logout task is handled at hawtio-oauth keycloak plugin
      return;
    }

    log.debug("Register 'DefaultLogout' to postLogoutTasks");
    postLogoutTasks.addTask('DefaultLogout', () => {
      log.debug("Log out, redirecting to:", AUTH_LOGOUT_URL);
      $window.location.href = AUTH_LOGOUT_URL;
    });
  }

}
