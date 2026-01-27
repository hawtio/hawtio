package io.hawt.tests.features.setup.deployment;

import org.keycloak.admin.client.Keycloak;

import dasniko.testcontainers.keycloak.KeycloakContainer;
import io.hawt.tests.features.config.TestConfiguration;

public class KeycloakDeployment {

    private static KeycloakContainer container;

    private static KeycloakContainer getContainer() {
        if (container == null) {
            container = new KeycloakContainer(TestConfiguration.getKeycloakImage()).withRealmImportFile("hawtio-demo-realm.json");
        }
        return container;
    }

    public static void start() {
        getContainer().start();
    }

    public static void stop() {
        if (container != null && container.isRunning()) {
            container.stop();
        }
    }

    public static String getIssuerURL() {
        return getContainer().getAuthServerUrl() + "/realms/hawtio-demo";
    }

    public static Keycloak adminClient() {
        return getContainer().getKeycloakAdminClient();
    }

    public static String getURL() {
        return getContainer().getAuthServerUrl();
    }
}
