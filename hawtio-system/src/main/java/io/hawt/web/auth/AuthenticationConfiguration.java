package io.hawt.web.auth;

import java.util.ArrayList;
import java.util.List;

import javax.security.auth.login.Configuration;
import jakarta.servlet.ServletContext;

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

    // Configuration properties
    public static final String AUTHENTICATION_ENABLED = "authenticationEnabled";
    public static final String NO_CREDENTIALS_401 = "noCredentials401";
    public static final String REALM = "realm";
    public static final String ROLE = "role";
    public static final String ROLES = "roles";
    public static final String ROLE_PRINCIPAL_CLASSES = "rolePrincipalClasses";
    public static final String AUTHENTICATION_CONTAINER_DISCOVERY_CLASSES = "authenticationContainerDiscoveryClasses";
    public static final String KEYCLOAK_ENABLED = "keycloakEnabled";

    // JVM system properties
    public static final String HAWTIO_AUTHENTICATION_ENABLED = "hawtio." + AUTHENTICATION_ENABLED;
    public static final String HAWTIO_NO_CREDENTIALS_401 = "hawtio." + NO_CREDENTIALS_401;
    public static final String HAWTIO_REALM = "hawtio." + REALM;
    public static final String HAWTIO_ROLE = "hawtio.role";
    public static final String HAWTIO_ROLES = "hawtio.roles";
    public static final String HAWTIO_ROLE_PRINCIPAL_CLASSES = "hawtio." + ROLE_PRINCIPAL_CLASSES;
    public static final String HAWTIO_AUTH_CONTAINER_DISCOVERY_CLASSES
        = "hawtio." + AUTHENTICATION_CONTAINER_DISCOVERY_CLASSES;
    public static final String HAWTIO_KEYCLOAK_ENABLED = "hawtio." + KEYCLOAK_ENABLED;

    // ServletContext attributes
    public static final String AUTHENTICATION_CONFIGURATION = "authenticationConfig";

    public static final String DEFAULT_REALM = "hawtio";
    private static final String DEFAULT_KARAF_ROLES = "admin,manager,viewer";
    public static final String DEFAULT_KARAF_ROLE_PRINCIPAL_CLASSES =
        "org.apache.karaf.jaas.boot.principal.RolePrincipal,"
            + "org.apache.karaf.jaas.modules.RolePrincipal,"
            + "org.apache.karaf.jaas.boot.principal.GroupPrincipal";
    public static final String TOMCAT_AUTH_CONTAINER_DISCOVERY =
        "io.hawt.web.tomcat.TomcatAuthenticationContainerDiscovery";

    private boolean enabled;
    private boolean noCredentials401;
    private String realm;
    private String role;
    private String rolePrincipalClasses;
    private Configuration configuration;
    private boolean keycloakEnabled;

    public AuthenticationConfiguration(ServletContext servletContext) {
        ConfigManager config = (ConfigManager) servletContext.getAttribute(ConfigManager.CONFIG_MANAGER);

        String defaultRolePrincipalClasses = "";

        if (System.getProperty("karaf.name") != null) {
            defaultRolePrincipalClasses = DEFAULT_KARAF_ROLE_PRINCIPAL_CLASSES;
        }

        String authDiscoveryClasses = TOMCAT_AUTH_CONTAINER_DISCOVERY;

        if (config != null) {
            this.realm = config.get(REALM).orElse(DEFAULT_REALM);
            // we have either role or roles
            String roles = config.get(ROLE).orElse(null);
            if (roles == null) {
                roles = config.get(ROLES).orElse(null);
            }
            if (roles == null) {
                // use default roles (karaf roles)
                roles = DEFAULT_KARAF_ROLES;
            }
            this.role = roles;
            this.rolePrincipalClasses = config.get(ROLE_PRINCIPAL_CLASSES).orElse(defaultRolePrincipalClasses);
            this.enabled = config.getBoolean(AUTHENTICATION_ENABLED, true);
            this.noCredentials401 = config.getBoolean(NO_CREDENTIALS_401, false);
            this.keycloakEnabled = this.enabled && config.getBoolean(KEYCLOAK_ENABLED, false);

            authDiscoveryClasses = config.get(AUTHENTICATION_CONTAINER_DISCOVERY_CLASSES).orElse(authDiscoveryClasses);
        }

        // JVM system properties can override always
        if (System.getProperty(HAWTIO_AUTHENTICATION_ENABLED) != null) {
            this.enabled = Boolean.getBoolean(HAWTIO_AUTHENTICATION_ENABLED);
        }
        if (System.getProperty(HAWTIO_NO_CREDENTIALS_401) != null) {
            this.noCredentials401 = Boolean.getBoolean(HAWTIO_NO_CREDENTIALS_401);
        }
        if (System.getProperty(HAWTIO_REALM) != null) {
            this.realm = System.getProperty(HAWTIO_REALM);
        }
        if (System.getProperty(HAWTIO_ROLE) != null) {
            this.role = System.getProperty(HAWTIO_ROLE);
        }
        if (System.getProperty(HAWTIO_ROLES) != null) {
            this.role = System.getProperty(HAWTIO_ROLES);
        }
        if (System.getProperty(HAWTIO_ROLE_PRINCIPAL_CLASSES) != null) {
            this.rolePrincipalClasses = System.getProperty(HAWTIO_ROLE_PRINCIPAL_CLASSES);
        }
        if (System.getProperty(HAWTIO_KEYCLOAK_ENABLED) != null) {
            this.keycloakEnabled = this.enabled && Boolean.getBoolean(HAWTIO_KEYCLOAK_ENABLED);
        }
        if (System.getProperty(HAWTIO_AUTH_CONTAINER_DISCOVERY_CLASSES) != null) {
            authDiscoveryClasses = System.getProperty(HAWTIO_AUTH_CONTAINER_DISCOVERY_CLASSES);
        }

        if (this.enabled) {
            List<AuthenticationContainerDiscovery> discoveries = getDiscoveries(authDiscoveryClasses);
            for (AuthenticationContainerDiscovery discovery : discoveries) {
                if (discovery.canAuthenticate(this)) {
                    LOG.info("Discovered container {} to use with hawtio authentication filter", discovery.getContainerName());
                    break;
                }
            }
        }

        if (this.enabled) {
            LOG.info("Starting hawtio authentication filter, JAAS realm: \"{}\" authorized role(s): \"{}\" role principal classes: \"{}\"",
                this.realm, this.role, this.rolePrincipalClasses);
        } else {
            LOG.info("Starting hawtio authentication filter, JAAS authentication disabled");
        }
    }

    public static AuthenticationConfiguration getConfiguration(ServletContext servletContext) {
        AuthenticationConfiguration authConfig = (AuthenticationConfiguration) servletContext.getAttribute(
            AUTHENTICATION_CONFIGURATION);
        if (authConfig == null) {
            authConfig = new AuthenticationConfiguration(servletContext);
            servletContext.setAttribute(AUTHENTICATION_ENABLED, authConfig.isEnabled());
            servletContext.setAttribute(AUTHENTICATION_CONFIGURATION, authConfig);
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

    public String getRole() {
        return role;
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
            ", role(s)='" + role + '\'' +
            ", rolePrincipalClasses='" + rolePrincipalClasses + '\'' +
            ", configuration=" + configuration +
            ", keycloakEnabled=" + keycloakEnabled +
            ']';
    }
}
