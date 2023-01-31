/// <reference path="../../node_modules/keycloak-js/dist/keycloak.d.ts"/>

namespace Login {

  const KEYCLOAK_ENABLED_URL: string = "keycloak/enabled";
  const KEYCLOAK_CLIENT_CONFIG_URL: string = "keycloak/client-config";
  const KEYCLOAK_VALIDATE_URL: string = "keycloak/validate-subject-matches";

  hawtioPluginLoader.registerPreBootstrapTask({
    name: 'KeycloakLoginBootstrap',
    task: (next) => {
      log.debug('Executing keycloak login bootstrap task');
      configureKeycloakIfEnabled(next);
    }
  }, true);

  function configureKeycloakIfEnabled(next: () => void): void {
    $.ajax(KEYCLOAK_ENABLED_URL, {
      type: "GET",
      success: (data: any, status: string, xhr: JQueryXHR) => {
        log.debug("Keycloak enabled:", data);
        let keycloakEnabled = (data === true || data === "true");
        if (keycloakEnabled) {
          loadKeycloakConfig(next);
        } else {
          next();
        }
      },
      error: (xhr: JQueryXHR, status: string, error: string) => {
        log.error("Failed to retrieve keycloak/enabled:", error);
        next();
      }
    });
  }

  function loadKeycloakConfig(next: () => void): void {
    $.ajax(KEYCLOAK_CLIENT_CONFIG_URL, {
      type: "GET",
      success: (data: any, status: string, xhr: JQueryXHR) => {
        log.debug("Loaded keycloak/client-config:", data);

        // This enables hawtio-oauth keycloak integration
        HawtioKeycloak.config = data;
        next();
      },
      error: (xhr: JQueryXHR, status: string, error: string) => {
        log.error("Failed to retrieve keycloak/client-config:", error);
        next();
      }
    });
  }

  // TODO: validate subject against server session
  function validateSubjectMatches(keycloakUser: string): void {
    let keycloakValidateUrl: string = `${KEYCLOAK_VALIDATE_URL}?keycloakUser=${encodeURIComponent(keycloakUser)}`;

    $.ajax(keycloakValidateUrl, {
      type: "GET",
      success: (data: any, status: string, xhr: JQueryXHR) => {
        log.debug("Got response for validate subject matches:", data);
      },
      error: (xhr: JQueryXHR, status: string, error: string) => {
        log.debug("Failed to validate subject matches:", error);
      }
    });
  }

}
