package io.hawt.web.auth.keycloak;

import io.hawt.system.ConfigManager;

/**
 * Helper class for Keycloak functionalities.
 */
public class KeycloakHelper {

    public static final String KEYCLOAK_ENABLED = "keycloakEnabled";
    public static final String HAWTIO_KEYCLOAK_ENABLED = "hawtio." + KEYCLOAK_ENABLED;

    public static boolean isKeycloakEnabled(ConfigManager config) {
        String keycloakEnabledCfg = config.get(KEYCLOAK_ENABLED, "false");
        if (System.getProperty(HAWTIO_KEYCLOAK_ENABLED) != null) {
            keycloakEnabledCfg = System.getProperty(HAWTIO_KEYCLOAK_ENABLED);
        }
        return Boolean.parseBoolean(keycloakEnabledCfg);
    }

}
