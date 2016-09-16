/// <reference path="./coreHelpers.ts"/>
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
        var keycloakEnabled: boolean = (response === true || response === "true");

        if (!keycloakEnabled) {
          var keycloakContext: KeycloakContext = createKeycloakContext(false);
          callback(keycloakContext);

        } else {
          loadKeycloakAdapter(callback);
        }
      },
      error: function (xhr, textStatus, error) {
        // Just fallback to false if we couldn't figure userDetails
        log.debug("Failed to retrieve if keycloak is enabled.: ", error);
        var keycloakContext: KeycloakContext = createKeycloakContext(false);
        callback(keycloakContext);
      }
    });
  };


  var loadKeycloakAdapter = function(callback: Function) {
    var keycloakJsonUrl: string = "keycloak/client-config";

    // Send ajax request to KeycloakServlet to figure out auth-server-url
    $.ajax(keycloakJsonUrl, <JQueryAjaxSettings> {
      type: "GET",
      success: function (response) {
        log.debug("Got response for check auth-server-url: ", response);

        var authServerUrl = response['auth-server-url'];
        var keycloakJsUrl = authServerUrl + '/js/keycloak.js';

        log.debug("Will download keycloak.js from URL ", keycloakJsUrl);
        loadScriptTag(keycloakJsUrl, callback);
      },
      error: function (xhr, textStatus, error) {
        // Just fallback to false if we couldn't figure userDetails
        log.debug("Failed to retrieve keycloak.js.: ", error);
        var keycloakContext: KeycloakContext = createKeycloakContext(false);
        callback(keycloakContext);
      }
    });

    var loadScriptTag = function(scriptUrl: string, callback: Function) {
      var scriptEl = document.createElement('script');
      scriptEl.type= "text/javascript";
      scriptEl.src = scriptUrl;
      scriptEl.onload = function() {
        var keycloakContext: KeycloakContext = createKeycloakContext(true);
        callback(keycloakContext);
      }

      document.getElementsByTagName("body")[0].appendChild(scriptEl);
    }

  };


  /**
   * Create keycloak context instance and push it to angular
   */
  var createKeycloakContext = function(keycloakEnabled: boolean): KeycloakContext {

    // It's KeycloakServlet, which handles to resolve keycloak.json on provided path
    var keycloakAuth: KeycloakModule.IKeycloak = keycloakEnabled ? new Keycloak('keycloak/client-config') : null;
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
          log.debug("validateSubjectMatches finished! Continue next task");
          // Continue next registered task and bootstrap Angular
          keycloakJaasLogin(keycloak, nextTask);
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

    // triggers JAAS request with keycloak accessToken as password. This will finish hawtio authentication
    var keycloakJaasLogin = function(keycloak: KeycloakModule.IKeycloak, callback: Function) {
        var url = "auth/login/";

        if (keycloak.token && keycloak.token != '') {
          log.debug('Keycloak authentication token found! Going to trigger JAAS');
          $.ajax(url, <JQueryAjaxSettings> {
            type: "POST",
            success: (response) => {
              log.debug("Got response for keycloakJaasLogin: ", response);
              callback();
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
            },
            beforeSend: (xhr) => {
              xhr.setRequestHeader('Authorization', Core.getBasicAuthHeader(keycloak.tokenParsed.preferred_username, keycloak.token));
            }
          });
        } else {
          notification('error', 'Keycloak auth token not found.');
        }

    };

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


  /**
   * Method is called from corePlugins. This is at the stage where Keycloak authentication is always finished.
   */
  _module.factory('keycloakPostLoginTasks', ["$rootScope", "userDetails", "jolokiaUrl", "localStorage", "keycloakContext", "postLogoutTasks", ($rootScope, userDetails:Core.UserDetails, jolokiaUrl, localStorage, keycloakContext: KeycloakContext, postLogoutTasks) => {

     var bootstrapIfNeeded1 = function() {
      if (keycloakContext.enabled) {
        log.debug("keycloakPostLoginTasks triggered");
        var keycloakAuth: KeycloakModule.IKeycloak = keycloakContext.keycloak;

        // Handle logout triggered from hawtio.
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
          Core.logout(jolokiaUrl, userDetails, localStorage, $rootScope);
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
                Core.logout(jolokiaUrl, userDetails, localStorage, $rootScope);
              });

              // Setup timeout again, so it is checked again next 5 seconds
              setPeriodicTokenRefresh();
            }, 5000);
          } else {
            log.debug('Keycloak not authenticated any more. Skip period for token refreshing');
          }
        }
        setPeriodicTokenRefresh();
      }
    };
    var answer = <KeycloakPostLoginTasks> {
        bootstrapIfNeeded: bootstrapIfNeeded1
    };

    return answer;
  }]);

}
