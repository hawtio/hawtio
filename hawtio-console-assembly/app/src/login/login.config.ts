/// <reference path="./login.component.ts"/>
/// <reference path="./keycloak-login.ts"/>

namespace Login {

  const USER_URL: string = 'user';
  const AUTH_LOGOUT_URL: string = 'auth/logout';

  export function init(authService: Core.AuthService, keycloakService: HawtioKeycloak.KeycloakService,
    postLogoutTasks: Core.Tasks, $window: ng.IWindowService, HawtioExtension: Core.HawtioExtension,
    $compile: ng.ICompileService): void {
    'ngInject';

    if (keycloakService.enabled) {
      // When Keycloak is enabled, login/logout is handled at hawtio-oauth keycloak plugin
      return;
    }

    // Get logged-in user from server session
    $.ajax(USER_URL, {
      type: "GET",
      success: (username: any, status: string, xhr: JQueryXHR) => {
        log.debug("Logged-in user:", username);

        authService.login(username, null);

        if (!authService.isDefaultUser()) {
          registerPostLogoutTasks(postLogoutTasks, $window);
          addLogoutLink(authService, HawtioExtension, $compile);
        }
      },
      error: (xhr: JQueryXHR, status: string, error: string) => {
        // Silently ignore as mostly it's just not logged-in yet
        log.debug("Failed to get logged-in user from server", error);
      }
    });
  }

  function registerPostLogoutTasks(postLogoutTasks: Core.Tasks, $window: ng.IWindowService) {
    log.debug("Register 'DefaultLogout' to postLogoutTasks");
    postLogoutTasks.addTask('DefaultLogout', () => {
      log.debug("Log out, redirecting to:", AUTH_LOGOUT_URL);
      $window.location.href = AUTH_LOGOUT_URL;
    });
  }

  function addLogoutLink(authService: Core.AuthService, HawtioExtension: Core.HawtioExtension,
    $compile: ng.ICompileService) {
    HawtioExtension.add('hawtio-logout', ($scope) => {
      $scope.authService = authService;
      let template = '<a href="" ng-click="authService.logout()">Logout</a>';
      return $compile(template)($scope);
    });
  }

}
