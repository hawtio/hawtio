package io.hawt.web.auth;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import javax.security.auth.login.Configuration;

import io.hawt.util.IOHelper;
import io.hawt.util.Strings;
import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.oidc.OidcConfiguration;
import jakarta.servlet.ServletContext;

import io.hawt.system.ConfigManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AuthenticationConfiguration {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationConfiguration.class);

    public static final String LOGIN_URL = "/login";

    // the below paths shouldn't be redirected to /login, because either they're for static resources we don't have to
    // protect (like site building resources - css, js, html) or they're related to authentication itself
    // finally, /jolokia and /proxy should not be redirected, because these are accessed via xhr/fetch and should
    // simply return 403 if needed
    // all these paths are passed to request.getServletPath().startsWith(), so it depends on servlet mapping
    // (relative to context path, so ignoring "/hawtio" for WAR or value from "management.server.base-path" property):
    //  - for prefix mapping, like "/jolokia/*", for request like "/jolokia/read/xxx", servlet path is "/jolokia"
    //  - for extension mapping, like "*.info", for request like "/x/y/z.info", servlet path is ... "/x/y/z.info"
    //  - for default mapping, "/", for request like "/css/defaults.css", servlet path is "/css/defaults.css"

    /**
     * Static resources paths, which should be always reachable.
     */
    public static final String[] UNSECURED_RESOURCE_PATHS = {
            "/index.html", "/favicon.ico", "/hawtconfig.json",
            "/robots.txt", "/json.worker.js", "/editor.worker.js",
            "/css", "/fonts", "/img", "/js", "/static"
    };

    /**
     * Paths related to authentication process.
     * {@code /login} path is actually a client-side router path, but Hawtio sometimes redirects (thus forcing
     * <em>server</em> request) to this path for unified authentication experience.
     * {@code /auth/*}, {@code /user}, {@code /keycloak} paths are actual servlet mappings.
     */
    public static final String[] UNSECURED_AUTHENTICATION_PATHS = {
            "/login",
            "/auth/login", "/auth/logout", "/auth/config",
            "/user", "/keycloak"
    };

    /**
     * Paths for configuration of the client (@hawtio/react) part.
     */
    public static final String[] UNSECURED_META_PATHS = {
            "/plugin",
            "/preset-connections"
    };

    /**
     * API paths. These may be confusing:<ul>
     *   <li>should NOT be redirected to /login, but</li>
     *   <li>should be protected otherwise (e.g., AuthenticationFilter)</li>
     * </ul>
     */
    public static final String[] UNSECURED_SERVLET_PATHS = {
            "/jolokia", "/proxy"
    };

    /**
     * Paths that shouldn't be redirected to {@code /login} when user is not authenticated.
     */
    public static final String[] UNSECURED_PATHS;

    static {
        ArrayList<String> l = new ArrayList<>();
        l.addAll(Arrays.asList(UNSECURED_RESOURCE_PATHS));
        l.addAll(Arrays.asList(UNSECURED_AUTHENTICATION_PATHS));
        l.addAll(Arrays.asList(UNSECURED_META_PATHS));
        l.addAll(Arrays.asList(UNSECURED_SERVLET_PATHS));
        UNSECURED_PATHS = l.toArray(String[]::new);
    }

    // =========================================================================
    // Configuration properties
    // =========================================================================

    /**
     * Enable or disable Hawtio's authentication. Value should be boolean.
     */
    public static final String AUTHENTICATION_ENABLED = "authenticationEnabled";

    /**
     * Shorthand for {@link AuthenticationConfiguration#AUTHENTICATION_ENABLED}.
     */
    public static final String AUTH = "auth";

    /**
     * Throttle authentication to protect Hawtio from brute force attacks.
     */
    public static final String AUTHENTICATION_THROTTLED = "authenticationThrottled";

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

    /**
     * Configuration property to specify a location for OIDC properties file.
     */
    public static final String OIDC_CLIENT_CONFIG = "oidcConfig";
    public static final String HAWTIO_OIDC_CLIENT_CONFIG = "hawtio." + OIDC_CLIENT_CONFIG;

    // =========================================================================

    // JVM system properties
    public static final String HAWTIO_AUTHENTICATION_ENABLED = "hawtio." + AUTHENTICATION_ENABLED;
    public static final String HAWTIO_AUTH = "hawtio." + AUTH;
    @SuppressWarnings("unused")
    public static final String HAWTIO_AUTHENTICATION_THROTTLED = "hawtio." + AUTHENTICATION_THROTTLED;
    public static final String HAWTIO_REALM = "hawtio." + REALM;
    public static final String HAWTIO_ROLES = "hawtio." + ROLES;
    public static final String HAWTIO_ROLE_PRINCIPAL_CLASSES = "hawtio." + ROLE_PRINCIPAL_CLASSES;
    @SuppressWarnings("unused")
    public static final String HAWTIO_NO_CREDENTIALS_401 = "hawtio." + NO_CREDENTIALS_401;
    @SuppressWarnings("unused")
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
    private final Optional<AuthenticationThrottler> throttler;
    private final String realm;
    private final String roles;
    private String rolePrincipalClasses;
    private final Class<? extends Principal> defaultRolePrincipalClass;
    private final boolean noCredentials401;
    private final boolean keycloakEnabled;

    /** Configuration to be used instead of relying on default {@link Configuration#getConfiguration()} */
    private Configuration configuration;

    private final ConfigManager configManager;
    // OidcConfiguration implements javax.security.auth.login.Configuration, but let's keep it separate from
    // this.configuration field
    private OidcConfiguration oidcConfiguration;

    /**
     * Flag indicating that Spring Security is not only available, but proper {@code SecurityFilterChain} was
     * configured in web application context.
     */
    private boolean springSecurityEnabled = false;

    private AuthenticationConfiguration(ServletContext servletContext) {
        ConfigManager config = (ConfigManager) servletContext.getAttribute(ConfigManager.CONFIG_MANAGER);
        if (config == null) {
            throw new RuntimeException("Hawtio config manager not found, cannot proceed Hawtio configuration");
        }
        configManager = config;

        // AUTH takes precedence over AUTHENTICATION_ENABLED because AUTH is mostly set manually by the user
        // whereas AUTHENTICATION_ENABLED may be predefined in a distribution.
        String auth = System.getProperty(HAWTIO_AUTH);
        if (auth != null) {
            System.setProperty(HAWTIO_AUTHENTICATION_ENABLED, auth);
        }

        this.enabled = config.getBoolean(AUTHENTICATION_ENABLED, true);
        this.realm = config.get(REALM).orElse(DEFAULT_REALM);
        this.roles = config.get(ROLES).orElse(DEFAULT_KARAF_ROLES);
        String defaultRolePrincipalClasses = isKaraf() ? DEFAULT_KARAF_ROLE_PRINCIPAL_CLASSES : "";
        this.rolePrincipalClasses = config.get(ROLE_PRINCIPAL_CLASSES).orElse(defaultRolePrincipalClasses);
        this.defaultRolePrincipalClass = determineDefaultRolePrincipalClass(this.rolePrincipalClasses);
        this.noCredentials401 = config.getBoolean(NO_CREDENTIALS_401, false);
        this.keycloakEnabled = this.enabled && config.getBoolean(KEYCLOAK_ENABLED, false);

        boolean throttled = config.getBoolean(AUTHENTICATION_THROTTLED, true);
        // Throttling should be disabled when Keycloak is used
        if (this.keycloakEnabled) {
            throttled = false;
        }
        LOG.info("Authentication throttling is {}", throttled ? "enabled" : "disabled");
        this.throttler = throttled ? Optional.of(new AuthenticationThrottler()) : Optional.empty();

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
                LOG.warn("Couldn't instantiate discovery {}", discoveryClass, e);
            }
        }
        return discoveries;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Optional<AuthenticationThrottler> getThrottler() {
        // Throttling should be disabled when OIDC or Keycloak or Spring Security is used
        if (isExternalAuthenticationEnabled()) {
            return Optional.empty();
        }
        return throttler;
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

    public Class<? extends Principal> getDefaultRolePrincipalClass() {
        return defaultRolePrincipalClass;
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    /**
     * When {@link Configuration} is provided, Hawtio will call special {@link javax.security.auth.login.LoginContext}
     * constructor where login modules are passed in programmatic way instead of being read from
     * a file specified with {@code -Djava.security.auth.login.config}
     *
     * @param configuration
     */
    public void setConfiguration(Configuration configuration) {
        this.configuration = configuration;
    }

    public boolean isKeycloakEnabled() {
        return keycloakEnabled;
    }

    public boolean isOidcEnabled() {
        return enabled && oidcConfiguration != null && oidcConfiguration.isEnabled();
    }

    public void setSpringSecurityEnabled(boolean springSecurityEnabled) {
        this.springSecurityEnabled = springSecurityEnabled;
    }

    public boolean isSpringSecurityEnabled() {
        return springSecurityEnabled;
    }

    public boolean isExternalAuthenticationEnabled() {
        return isKeycloakEnabled() || isOidcEnabled() || isSpringSecurityEnabled();
    }

    /**
     * Initialize OIDC configuration, so it is available both in {@link AuthConfigurationServlet} and
     * {@link io.hawt.web.filters.ContentSecurityPolicyFilter}.
     */
    public void configureOidc() {
        String oidcConfigFile = configManager.get(OIDC_CLIENT_CONFIG).orElse(null);

        // JVM system properties can override always
        if (System.getProperty(HAWTIO_OIDC_CLIENT_CONFIG) != null) {
            oidcConfigFile = System.getProperty(HAWTIO_OIDC_CLIENT_CONFIG);
        }

        if (Strings.isBlank(oidcConfigFile)) {
            oidcConfigFile = defaultOidcConfigLocation();
        }

        LOG.info("Looking for OIDC configuration file in: {}", oidcConfigFile);

        InputStream is = ServletHelpers.loadFile(oidcConfigFile);
        if (is != null) {
            LOG.info("Reading OIDC configuration.");
            Properties props = new Properties();
            try {
                props.load(is);
                this.oidcConfiguration = new OidcConfiguration(props);
                this.oidcConfiguration.setRolePrincipalClass(defaultRolePrincipalClass);
                if (this.oidcConfiguration.isEnabled()) {
                    this.configuration = this.oidcConfiguration;
                }
            } catch (IOException e) {
                LOG.warn("Couldn't read OIDC configuration file", e);
            } finally {
                IOHelper.close(is, "oidcInputStream", LOG);
            }
        }
    }

    /**
     * Similarly to Keycloak configuration, we'll try well-known configuration locations.
     *
     * @return config location to be used by default
     */
    protected String defaultOidcConfigLocation() {
        String karafBase = System.getProperty("karaf.base");
        if (karafBase != null) {
            return karafBase + "/etc/hawtio-oidc.properties";
        }

        String jettyHome = System.getProperty("jetty.home");
        if (jettyHome != null) {
            return jettyHome + "/etc/hawtio-oidc.properties";
        }

        String tomcatHome = System.getProperty("catalina.home");
        if (tomcatHome != null) {
            return tomcatHome + "/conf/hawtio-oidc.properties";
        }

        String jbossHome = System.getProperty("jboss.server.config.dir");
        if (jbossHome != null) {
            return jbossHome + "/hawtio-oidc.properties";
        }

        String artemisHome = System.getProperty("artemis.instance.etc");
        if (artemisHome != null) {
            return artemisHome + "/hawtio-oidc.properties";
        }

        // Fallback to classpath inside hawtio.war
        return "classpath:hawtio-oidc.properties";
    }

    public OidcConfiguration getOidcConfiguration() {
        return oidcConfiguration;
    }

    /**
     * Parses Hawtio configuration option for role principal classes (comma-separated list of class names)
     * and returns first that's available and has proper (1-arg String) constructor.
     *
     * @param rolePrincipalClasses
     * @return
     */
    private Class<? extends Principal> determineDefaultRolePrincipalClass(String rolePrincipalClasses) {
        if (rolePrincipalClasses == null || rolePrincipalClasses.isBlank()) {
            return null;
        } else {
            String[] roleClasses = rolePrincipalClasses.split("\\s*,\\s*");
            Class<? extends Principal> roleClass = null;

            // let's load first available class - needs 1-arg String constructor
            for (String classCandidate : roleClasses) {
                Class<? extends Principal> clz = tryLoadClass(classCandidate, Principal.class);
                if (clz != null) {
                    try {
                        Constructor<?> ctr = clz.getConstructor(String.class);
                        roleClass = clz;
                    } catch (NoSuchMethodException e) {
                        LOG.warn("Can't use role principal class {}: {}", classCandidate, e.getMessage());
                    }
                }
            }

            return roleClass;
        }
    }

    @SuppressWarnings("unchecked")
    private <T> Class<T> tryLoadClass(String roleClass, Class<T> clazz) {
        try {
            Class<?> cls = getClass().getClassLoader().loadClass(roleClass);
            if (clazz.isAssignableFrom(cls)) {
                return (Class<T>) cls;
            } else {
                LOG.warn("Class {} doesn't implement {}", cls, clazz);
            }
        } catch (ClassNotFoundException ignored) {
        }
        try {
            Class<?> cls = Thread.currentThread().getContextClassLoader().loadClass(roleClass);
            if (clazz.isAssignableFrom(cls)) {
                return clazz;
            } else {
                LOG.warn("Class {} doesn't implement {}", cls, clazz);
            }
        } catch (ClassNotFoundException ignored) {
        }
        return null;
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
            ", oidcEnabled=" + (oidcConfiguration != null && oidcConfiguration.isEnabled()) +
            ']';
    }
}
