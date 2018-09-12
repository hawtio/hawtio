/// <reference path="./login.component.ts"/>
/// <reference path="./keycloak-login.ts"/>

namespace Login {

  const USER_URL: string = 'user';
  const AUTH_LOGOUT_URL: string = 'auth/logout';

  export const loginModule = angular
    .module('hawtio-login', [])
    .component('hawtioLogin', loginComponent)
    .run(addLogoutToUserDropdown)
    .run(loginUserDetails)
    .name;

  export const log = Logger.get(loginModule);

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

  function loginUserDetails(userDetails: Core.AuthService,
    keycloakService: HawtioKeycloak.KeycloakService, postLogoutTasks: Core.Tasks,
    $window: ng.IWindowService): void {
    'ngInject';

    if (keycloakService.enabled) {
      // When Keycloak is enabled, login/logout is handled at hawtio-oauth keycloak plugin
      return;
    }

    // Get logged-in user from server session
    $.ajax(USER_URL, {
      type: "GET",
      success: (data: any, status: string, xhr: JQueryXHR) => {
        log.debug("Logged-in user:", data);
        userDetails.login(data, null);

        log.debug("Register 'DefaultLogout' to postLogoutTasks");
        postLogoutTasks.addTask('DefaultLogout', () => {
          log.debug("Log out, redirecting to:", AUTH_LOGOUT_URL);
          $window.location.href = AUTH_LOGOUT_URL;
        });
      },
      error: (xhr: JQueryXHR, status: string, error: string) => {
        // Silently ignore as mostly it's just not logged-in yet
        log.debug("Failed to get logged-in user from server", error);
      }
    });
  }

}
