/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
module Core {

  var log = Logger.get('Keycloak');

  // log.setLevel(Logger.DEBUG);

  var checkKeycloakEnabled = function(callback: Function) {
    var keycloakEnabledUrl: string = "keycloak/enabled";

    // Send ajax request to KeycloakServlet to figure out if keycloak integration is enabled
    $.ajax(keycloakEnabledUrl, <JQueryAjaxSettings> {
      type: "GET",
      success: function (response) {
        log.debug("Got response for check if keycloak is enabled: ", response);
        var keycloakEnabled: boolean = response;

        var keycloakContext: KeycloakContext = createKeycloakContext(keycloakEnabled);
        callback(keycloakContext);
      },
      error: function (xhr, textStatus, error) {
        // Just fallback to false if we couldn't figure userDetails
        log.debug("Failed to retrieve if keycloak is enabled.: ", error);
        var keycloakContext: KeycloakContext = createKeycloakContext(false);
        callback(keycloakContext);
      }
    });
  };

  /**
   * Create keycloak context instance and push it to angular
   */
  var createKeycloakContext = function(keycloakEnabled: boolean): KeycloakContext {

    // It's KeycloakServlet, which handles to resolve keycloak.json on provided path
    var keycloakAuth: KeycloakModule.IKeycloak = new Keycloak('keycloak/client-config');
    var keycloakContext: KeycloakContext = {
      enabled: keycloakEnabled,
      keycloak: keycloakAuth
    }

    // Push it to angular
    _module.factory('keycloakContext', function () {
      return keycloakContext;
    });

    return keycloakContext;
  };


  var initKeycloakIfNeeded = function(keycloakContext: KeycloakContext, nextTask: Function) {
    if (keycloakContext.enabled) {
      log.debug('Keycloak authentication required. Initializing Keycloak');
      var keycloak: KeycloakModule.IKeycloak = keycloakContext.keycloak;

      var kcInitOptions;
      if ('keycloakToken' in window) {
        kcInitOptions = window['keycloakToken'];
        log.debug('Initialize keycloak with token passed from different window');
      } else {
        kcInitOptions = { onLoad: 'login-required' };
      }

      keycloak.init(kcInitOptions).success(function () {
        var keycloakUsername: string = keycloak.tokenParsed.preferred_username;
        log.debug("Keycloak authenticated with Subject " + keycloakUsername + ". Validating subject matches");

        validateSubjectMatches(keycloakUsername, function() {
          log.debug("Keycloak authentication finished! Continue next task");
          // Continue next registered task and bootstrap Angular
          nextTask();
        });
      }).error(function () {
        log.warn("Keycloak authentication failed!");
        notification('error', 'Failed to log in to Keycloak');
      });
    } else {
      // Just continue
      log.debug('Keycloak authentication not required. Skip Keycloak bootstrap');
      nextTask();
    }
  };


  /**
   * Validate if subject authenticated through Keycloak matches with SSO
   */
  var validateSubjectMatches = function(keycloakUser: string, callback: Function) {
    var keycloakValidateUrl: string = "keycloak/validate-subject-matches?keycloakUser=" + encodeURIComponent(keycloakUser);

    // Send ajax request to KeycloakServlet to figure out if keycloak integration is enabled
    $.ajax(keycloakValidateUrl, <JQueryAjaxSettings> {
      type: "GET",
      success: function (response) {
        log.debug("Got response for validate subject matches: ", response);
        callback();
      },
      error: function (xhr, textStatus, error) {
        // Just fallback to false if we couldn't figure userDetails
        log.debug("Failed to validate subject matches: ", error);
        callback();
      }
    });
  }

  /**
   * Prebootstrap task, which handles Keycloak OAuth flow. It will first check if keycloak is enabled and then possibly init keycloak.
   * It will continue with Angular bootstrap just when Keycloak authentication is successfully finished
   */
  hawtioPluginLoader.registerPreBootstrapTask(function (nextTask) {
    log.debug('Prebootstrap task executed');

    checkKeycloakEnabled(function(keycloakContext) {
      initKeycloakIfNeeded(keycloakContext, nextTask);
    });
  });

  // This is used to track if we already processed loginController for this window. Because hawtio may redirect to "/login" more times and we don't want to trigger controller every time this happens
  var loginControllerProcessed: boolean = false;

  /**
   * Method is called from LoginController when '/login' URL is opened and we have keycloak integration enabled.
   * It registers needed logout tasks and send request for JAAS login with keycloak authToken attached as password
   */
  export var keycloakLoginController = function($scope, jolokia, userDetails:Core.UserDetails, jolokiaUrl, workspace, localStorage, keycloakContext: KeycloakContext, postLogoutTasks) {
    if (loginControllerProcessed) {
      log.debug('Skip processing login controller as it was already processed this request!');
      return;
    }

    // Now switch to true and allow controller to be processed again after 30 seconds
    loginControllerProcessed = true;
    setTimeout(function() {
        loginControllerProcessed = false;
    }, 30000);

    log.debug("keycloakLoginController triggered");
    var keycloakAuth: KeycloakModule.IKeycloak = keycloakContext.keycloak;

    // Handle logout triggered from hawtio. Maybe not best to add it here but should work as tasks are tracked by name
    postLogoutTasks.addTask('KeycloakLogout', function () {
      if (keycloakAuth.authenticated) {
        log.debug("postLogoutTask: Going to trigger keycloak logout");
        keycloakAuth.logout();

        // We redirected to keycloak logout. Skip execution of onComplete callback
        return false;
      } else {
        log.debug("postLogoutTask: Keycloak not authenticated. Skip calling keycloak logout");
        return true;
      }
    });

    // Detect keycloak logout based on iframe. We need to trigger hawtio logout too to ensure single-sign-out
    keycloakAuth.onAuthLogout = function() {
      log.debug('keycloakAuth.onAuthLogout triggered!');
      Core.logout(jolokiaUrl, userDetails, localStorage, $scope);
    };

    // Handle periodic refreshing of keycloak token. Token validity is checked each 5 seconds and token is refreshed if it is going to expire
    // Periodic refreshment is stopped once we detect that we are not logged anymore to keycloak
    var setPeriodicTokenRefresh = function() {
      if (keycloakAuth.authenticated) {
        setTimeout(function() {
          keycloakAuth.updateToken(10).success(function(refreshed) {
            if (refreshed) {
              log.debug('Keycloak token refreshed. Set new value to userDetails');
              userDetails.password = keycloakAuth.token;
            }
          }).error(function() {
            log.warn('Failed to refresh keycloak token!');
          });

          // Setup timeout again, so it is checked again next 5 seconds
          setPeriodicTokenRefresh();
        }, 5000);
      } else {
        log.debug('Keycloak not authenticated any more. Skip period for token refreshing');
      }
    }

    // triggers JAAS request with keycloak accessToken as password. This will finish hawtio authentication
    var doKeycloakJaasLogin = function() {
      if (jolokiaUrl) {
        var url = "auth/login/";

        if (keycloakAuth.token && keycloakAuth.token != '') {
          log.debug('Keycloak authentication token found! Going to trigger JAAS');
          $.ajax(url, {
            type: "POST",
            success: (response) => {
              log.debug('Callback from JAAS login!');
              userDetails.username = keycloakAuth.tokenParsed.preferred_username;
              userDetails.password = keycloakAuth.token;
              userDetails.loginDetails = response;

              setPeriodicTokenRefresh();

              jolokia.start();
              workspace.loadTree();
              Core.executePostLoginTasks();
              Core.$apply($scope);
            },
            error: (xhr, textStatus, error) => {
              switch (xhr.status) {
                case 401:
                  notification('error', 'Failed to log in, ' + error);
                  break;
                case 403:
                  notification('error', 'Failed to log in, ' + error);
                  break;
                default:
                  notification('error', 'Failed to log in, ' + error);
                  break;
              }
              Core.$apply($scope);
            },
            beforeSend: (xhr) => {
              xhr.setRequestHeader('Authorization', Core.getBasicAuthHeader(keycloakAuth.tokenParsed.preferred_username, keycloakAuth.token));
            }
          });
        } else {
          notification('error', 'Keycloak auth token not found.');
        }
      }
    };

    doKeycloakJaasLogin();
  };

}
