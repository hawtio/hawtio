package io.hawt.web.auth;

import java.util.ArrayList;
import java.util.List;
import javax.security.auth.login.Configuration;
import javax.servlet.ServletContext;

import io.hawt.system.ConfigManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AuthenticationConfiguration {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationConfiguration.class);

    public static final String LOGIN_URL = "/auth/login";
    public static final String[] UNSECURED_PATHS = {
        "/login", "/auth/login", "/auth/logout",
        "/css", "/fonts", "/img", "/js", "/static", "/hawtconfig.json",
        "/jolokia", "/user", "/keycloak", "/plugin", "/oauth"
    };

    // =========================================================================
    // Configuration properties
    // =========================================================================

    /**
     * Enable or disable Hawtio's authentication. Value should be boolean.
     */
    public static final String AUTHENTICATION_ENABLED = "authenticationEnabled";

    /**
     * JAAS realm used to authenticate users.
     */
    public static final String REALM = "realm";

    /**
     * Authorized user roles. Empty string disables authorization.
     */
    public static final String ROLES = "roles";

    /**
     * JAAS class name that would contain the role principal.
     * Empty string disables authorization.
     */
    public static final String ROLE_PRINCIPAL_CLASSES = "rolePrincipalClasses";

    /**
     * Whether to return 401 on No Credentials authentication error.
     * Value should be boolean.
     */
    public static final String NO_CREDENTIALS_401 = "noCredentials401";

    /**
     * AuthenticationContainerDiscovery classes divided by comma, which are used
     * to discover container environments.
     */
    public static final String AUTHENTICATION_CONTAINER_DISCOVERY_CLASSES = "authenticationContainerDiscoveryClasses";

    /**
     * Enable or disable Keycloak integration. Value should be boolean.
     */
    public static final String KEYCLOAK_ENABLED = "keycloakEnabled";

    // =========================================================================

    // JVM system properties
    public static final String HAWTIO_AUTHENTICATION_ENABLED = "hawtio." + AUTHENTICATION_ENABLED;
    public static final String HAWTIO_REALM = "hawtio." + REALM;
    public static final String HAWTIO_ROLES = "hawtio." + ROLES;
    public static final String HAWTIO_ROLE_PRINCIPAL_CLASSES = "hawtio." + ROLE_PRINCIPAL_CLASSES;
    public static final String HAWTIO_NO_CREDENTIALS_401 = "hawtio." + NO_CREDENTIALS_401;
    public static final String HAWTIO_AUTH_CONTAINER_DISCOVERY_CLASSES = "hawtio." + AUTHENTICATION_CONTAINER_DISCOVERY_CLASSES;
    public static final String HAWTIO_KEYCLOAK_ENABLED = "hawtio." + KEYCLOAK_ENABLED;

    // ServletContext attributes
    public static final String AUTHENTICATION_CONFIGURATION = "authenticationConfig";

    // Default values
    public static final String DEFAULT_REALM = "hawtio";
    private static final String DEFAULT_KARAF_ROLES = "admin,manager,viewer";
    public static final String DEFAULT_KARAF_ROLE_PRINCIPAL_CLASSES =
        "org.apache.karaf.jaas.boot.principal.RolePrincipal,"
            + "org.apache.karaf.jaas.modules.RolePrincipal,"
            + "org.apache.karaf.jaas.boot.principal.GroupPrincipal";
    public static final String TOMCAT_AUTH_CONTAINER_DISCOVERY =
        "io.hawt.web.tomcat.TomcatAuthenticationContainerDiscovery";

    private final boolean enabled;
    private final String realm;
    private final String roles;
    private String rolePrincipalClasses;
    private final boolean noCredentials401;
    private final boolean keycloakEnabled;
    private Configuration configuration;

    public AuthenticationConfiguration(ServletContext servletContext) {
        ConfigManager config = (ConfigManager) servletContext.getAttribute(ConfigManager.CONFIG_MANAGER);
        if (config == null) {
            throw new RuntimeException("Hawtio config manager not found, cannot proceed Hawtio configuration");
        }

        this.enabled = config.getBoolean(AUTHENTICATION_ENABLED, true);
        this.realm = config.get(REALM).orElse(DEFAULT_REALM);
        this.roles = config.get(ROLES).orElse(DEFAULT_KARAF_ROLES);
        String defaultRolePrincipalClasses = isKaraf() ? DEFAULT_KARAF_ROLE_PRINCIPAL_CLASSES : "";
        this.rolePrincipalClasses = config.get(ROLE_PRINCIPAL_CLASSES).orElse(defaultRolePrincipalClasses);
        this.noCredentials401 = config.getBoolean(NO_CREDENTIALS_401, false);
        this.keycloakEnabled = this.enabled && config.getBoolean(KEYCLOAK_ENABLED, false);

        if (this.enabled) {
            String authDiscoveryClasses = config.get(AUTHENTICATION_CONTAINER_DISCOVERY_CLASSES).orElse(TOMCAT_AUTH_CONTAINER_DISCOVERY);
            List<AuthenticationContainerDiscovery> discoveries = getDiscoveries(authDiscoveryClasses);
            for (AuthenticationContainerDiscovery discovery : discoveries) {
                if (discovery.canAuthenticate(this)) {
                    LOG.info("Discovered container {} to use with hawtio authentication filter", discovery.getContainerName());
                    break;
                }
            }

            LOG.info(
                "Starting Hawtio authentication filter, JAAS realm: \"{}\" authorized role(s): \"{}\" role principal classes: \"{}\"",
                this.realm, this.roles, this.rolePrincipalClasses);
        } else {
            LOG.info("Starting hawtio authentication filter, JAAS authentication disabled");
        }
    }

    private static boolean isKaraf() {
        return System.getProperty("karaf.name") != null;
    }

    public static AuthenticationConfiguration getConfiguration(ServletContext servletContext) {
        AuthenticationConfiguration authConfig = (AuthenticationConfiguration) servletContext.getAttribute(AUTHENTICATION_CONFIGURATION);
        if (authConfig == null) {
            authConfig = new AuthenticationConfiguration(servletContext);
            servletContext.setAttribute(AUTHENTICATION_CONFIGURATION, authConfig);
            // TODO: Used only from SessionExpiryFilter
            servletContext.setAttribute(AUTHENTICATION_ENABLED, authConfig.isEnabled());
        }
        return authConfig;
    }

    private static List<AuthenticationContainerDiscovery> getDiscoveries(String authDiscoveryClasses) {
        List<AuthenticationContainerDiscovery> discoveries = new ArrayList<>();
        if (authDiscoveryClasses == null || authDiscoveryClasses.trim().isEmpty()) {
            return discoveries;
        }

        String[] discoveryClasses = authDiscoveryClasses.split(",");
        for (String discoveryClass : discoveryClasses) {
            try {
                // Should have more clever classloading?
                @SuppressWarnings("unchecked")
                Class<? extends AuthenticationContainerDiscovery> clazz =
                    (Class<? extends AuthenticationContainerDiscovery>) AuthenticationConfiguration.class
                        .getClassLoader().loadClass(discoveryClass.trim());
                AuthenticationContainerDiscovery discovery = clazz.getDeclaredConstructor().newInstance();
                discoveries.add(discovery);
            } catch (Exception e) {
                LOG.warn("Couldn't instantiate discovery " + discoveryClass, e);
            }
        }
        return discoveries;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isNoCredentials401() {
        return noCredentials401;
    }

    public String getRealm() {
        return realm;
    }

    public String getRoles() {
        return roles;
    }

    public String getRolePrincipalClasses() {
        return rolePrincipalClasses;
    }

    public void setRolePrincipalClasses(String rolePrincipalClasses) {
        this.rolePrincipalClasses = rolePrincipalClasses;
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(Configuration configuration) {
        this.configuration = configuration;
    }

    public boolean isKeycloakEnabled() {
        return keycloakEnabled;
    }

    @Override
    public String toString() {
        return "AuthenticationConfiguration[" +
            "enabled=" + enabled +
            ", noCredentials401=" + noCredentials401 +
            ", realm='" + realm + '\'' +
            ", roles='" + roles + '\'' +
            ", rolePrincipalClasses='" + rolePrincipalClasses + '\'' +
            ", configuration=" + configuration +
            ", keycloakEnabled=" + keycloakEnabled +
            ']';
    }
}
