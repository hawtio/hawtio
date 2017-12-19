package io.hawt.web.auth;

import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletContext;

import io.hawt.system.ConfigManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ConfigurationManager {

    private static final transient Logger LOG = LoggerFactory.getLogger(ConfigurationManager.class);

    // JVM system properties
    public static final String HAWTIO_NO_CREDENTIALS_401 = "hawtio.noCredentials401";
    public static final String HAWTIO_AUTHENTICATION_ENABLED = "hawtio.authenticationEnabled";
    public static final String HAWTIO_REALM = "hawtio.realm";
    public static final String HAWTIO_ROLE = "hawtio.role";
    public static final String HAWTIO_ROLES = "hawtio.roles";
    public static final String HAWTIO_ROLE_PRINCIPAL_CLASSES = "hawtio.rolePrincipalClasses";
    public static final String HAWTIO_AUTH_CONTAINER_DISCOVERY_CLASSES = "hawtio.authenticationContainerDiscoveryClasses";

    private static final String AUTHENTICATION_CONFIGURATION = "authenticationConfig";

    private static final String DEFAULT_KARAF_ROLES = "admin,manager,viewer";

    private ConfigurationManager() {
    }

    public static AuthenticationConfiguration getConfiguration(ServletContext servletContext) {
        AuthenticationConfiguration configuration = (AuthenticationConfiguration) servletContext.getAttribute(
            AUTHENTICATION_CONFIGURATION);
        if (configuration == null) {
            configuration = createConfiguration(servletContext);
            servletContext.setAttribute("authenticationEnabled", configuration.isEnabled());
            servletContext.setAttribute(AUTHENTICATION_CONFIGURATION, configuration);
        }
        return configuration;
    }

    private static AuthenticationConfiguration createConfiguration(ServletContext servletContext) {
        AuthenticationConfiguration configuration = new AuthenticationConfiguration();
        ConfigManager config = (ConfigManager) servletContext.getAttribute("ConfigManager");

        String defaultRolePrincipalClasses = "";

        if (System.getProperty("karaf.name") != null) {
            defaultRolePrincipalClasses = "org.apache.karaf.jaas.boot.principal.RolePrincipal,org.apache.karaf.jaas.modules.RolePrincipal,org.apache.karaf.jaas.boot.principal.GroupPrincipal";
        }

        String authDiscoveryClasses = "io.hawt.web.tomcat.TomcatAuthenticationContainerDiscovery";

        if (config != null) {
            configuration.setRealm(config.get("realm", "karaf"));
            // we have either role or roles
            String roles = config.get("role", null);
            if (roles == null) {
                roles = config.get("roles", null);
            }
            if (roles == null) {
                // use default roles (karaf roles)
                roles = DEFAULT_KARAF_ROLES;
            }
            configuration.setRole(roles);
            configuration.setRolePrincipalClasses(config.get("rolePrincipalClasses", defaultRolePrincipalClasses));
            configuration.setEnabled(Boolean.parseBoolean(config.get("authenticationEnabled", "true")));
            configuration.setNoCredentials401(Boolean.parseBoolean(config.get("noCredentials401", "false")));

            authDiscoveryClasses = config.get("authenticationContainerDiscoveryClasses", authDiscoveryClasses);
        }

        // JVM system properties can override always
        if (System.getProperty(HAWTIO_AUTHENTICATION_ENABLED) != null) {
            configuration.setEnabled(Boolean.getBoolean(HAWTIO_AUTHENTICATION_ENABLED));
        }
        if (System.getProperty(HAWTIO_NO_CREDENTIALS_401) != null) {
            configuration.setNoCredentials401(Boolean.getBoolean(HAWTIO_NO_CREDENTIALS_401));
        }
        if (System.getProperty(HAWTIO_REALM) != null) {
            configuration.setRealm(System.getProperty(HAWTIO_REALM));
        }
        if (System.getProperty(HAWTIO_ROLE) != null) {
            configuration.setRole(System.getProperty(HAWTIO_ROLE));
        }
        if (System.getProperty(HAWTIO_ROLES) != null) {
            configuration.setRole(System.getProperty(HAWTIO_ROLES));
        }
        if (System.getProperty(HAWTIO_ROLE_PRINCIPAL_CLASSES) != null) {
            configuration.setRolePrincipalClasses(System.getProperty(HAWTIO_ROLE_PRINCIPAL_CLASSES));
        }
        if (System.getProperty(HAWTIO_AUTH_CONTAINER_DISCOVERY_CLASSES) != null) {
            authDiscoveryClasses = System.getProperty(HAWTIO_AUTH_CONTAINER_DISCOVERY_CLASSES);
        }

        if (configuration.isEnabled()) {
            List<AuthenticationContainerDiscovery> discoveries = getDiscoveries(authDiscoveryClasses);
            for (AuthenticationContainerDiscovery discovery : discoveries) {
                if (discovery.canAuthenticate(configuration)) {
                    LOG.info("Discovered container {} to use with hawtio authentication filter", discovery.getContainerName());
                    break;
                }
            }
        }

        if (configuration.isEnabled()) {
            LOG.info("Starting hawtio authentication filter, JAAS realm: \"{}\" authorized role(s): \"{}\" role principal classes: \"{}\"",
                configuration.getRealm(), configuration.getRole(), configuration.getRolePrincipalClasses());
        } else {
            LOG.info("Starting hawtio authentication filter, JAAS authentication disabled");
        }

        return configuration;
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
                Class<? extends AuthenticationContainerDiscovery> clazz = (Class<? extends AuthenticationContainerDiscovery>) ConfigurationManager.class.getClassLoader().loadClass(discoveryClass.trim());
                AuthenticationContainerDiscovery discovery = clazz.newInstance();
                discoveries.add(discovery);
            } catch (Exception e) {
                LOG.warn("Couldn't instantiate discovery " + discoveryClass, e);
            }
        }
        return discoveries;
    }

}
