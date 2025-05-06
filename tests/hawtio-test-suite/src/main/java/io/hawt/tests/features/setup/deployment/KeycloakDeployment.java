package io.hawt.tests.features.setup.deployment;

import org.keycloak.admin.client.Keycloak;

import dasniko.testcontainers.keycloak.KeycloakContainer;
import io.hawt.tests.features.config.TestConfiguration;

public class KeycloakDeployment {

    private static KeycloakContainer container = new KeycloakContainer(TestConfiguration.getKeycloakImage())
        .withRealmImportFile("hawtio-demo-realm.json");

    public static void start() {
        container.start();
    }

    public static void stop() {
        if (container.isRunning()) {
            container.stop();
        }
    }

    public static String getIssuerURL() {
        return container.getAuthServerUrl() + "/realms/hawtio-demo";
    }

    public static Keycloak adminClient() {
        return container.getKeycloakAdminClient();
    }

    public static String getURL() {
        return container.getAuthServerUrl();
    }
}
