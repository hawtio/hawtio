package io.hawt.web.auth;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.Set;
import javax.security.auth.login.AppConfigurationEntry;
import javax.security.auth.login.Configuration;

import io.hawt.util.IOHelper;
import io.hawt.util.Strings;
import io.hawt.web.ServletHelpers;
import io.hawt.web.auth.oidc.OidcConfiguration;
import io.hawt.web.tomcat.TomcatAuthenticationContainerDiscovery;
import jakarta.servlet.ServletContext;

import io.hawt.system.ConfigManager;
import org.jolokia.server.core.http.AgentServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>Entire security related configuration for Hawtio applications. Should be created according to the lifecycle
 * specific to deployment environment. In Servlet containers, this should be created in
 * {@link io.hawt.HawtioContextListener} (or subclass).</p>
 *
 * <p>When using different environment (like embedding
 * Hawtio with Netty or JDK HTTP Server) it is important to properly initialize this configuration and call
 * {@link #initializationComplete}.</p>
 */
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
     * Old version of the "roles" property for those who didn't migrate
     *
     * @deprecated use "roles"
     */
    @Deprecated
    public static final String ROLE = "role";

    /**
     * JAAS class name that would contain the role principal.
     * Empty string effectively disables authorization (so only authentication is performed).
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
    public static final String HAWTIO_AUTHENTICATION_THROTTLED = "hawtio." + AUTHENTICATION_THROTTLED;
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
    public static final List<String> DEFAULT_KARAF_ROLE_PRINCIPAL_CLASSES = List.of(
        "org.apache.karaf.jaas.boot.principal.RolePrincipal",
        "org.apache.karaf.jaas.modules.RolePrincipal",
        "org.apache.karaf.jaas.boot.principal.GroupPrincipal"
    );

    /** Whether authentication is enabled at all - defaults to {@code true} */
    private final boolean enabled;

    /**
     * <em>Realm</em> for Hawtio application, which can be interpreted as BASIC authentication realm or
     * <em>application</em> in JAAS sense (a key into a {@link Configuration}).
     */
    private final String realm;

    /**
     * JAAS role names required by Hawtio for successful authentication. When there are no roles, authentication
     * is still enabled, but there's no <em>authorization</em>.
     */
    private final List<String> roles = new ArrayList<>();

    /**
     * JAAS {@link Principal} classes supported by Hawtio. Dynamic authentication mechanisms may add specific
     * {@link Principal} types and some types may be specific to deployment environment or servlet container.
     */
    private final Set<String> rolePrincipalClassNames = new LinkedHashSet<>();

    /**
     * Actual {@link Class} objects known by Hawtio as supported {@link Principal} classes.
     */
    private List<Class<Principal>> rolePrincipalClasses;

    /**
     * When Hawtio itself creates principals using own {@link javax.security.auth.spi.LoginModule login modules}
     * the {@link Principal principals} added to authenticated subjects will use this class.<br />
     * This class will have public, 1-arg constructor accepting String with principal (role) name.
     */
    private Class<? extends Principal> defaultRolePrincipalClass;

    /**
     * Whether authentication failure should result in 401 ({@code true}) (WWW-Authenticate challenge)
     * or 403 (when {@cpde false}).
     */
    private final boolean noCredentials401;

    /**
     * Whether native Keycloak (no generic OIDC) is enabled
     */
    private final boolean keycloakEnabled;

    private AuthenticationThrottler throttler;

    private volatile boolean initialized = false;

    /**
     * If user doesn't configure {@code hawtio.authenticationContainerDiscoveryClasses} option we will use
     * the default, built-in discovery classes.
     */
    @SuppressWarnings("FieldCanBeLocal")
    private final List<AuthenticationContainerDiscovery> builtInIntegrations = List.of(
            new TomcatAuthenticationContainerDiscovery()
    );

    /**
     * Merged {@link Configuration JAAS configuration} to be used when performing authentication in Hawtio.
     */
    private Configuration configuration;

    /**
     * Dynamic {@link Configuration JAAS configuration} configured during Hawtio initialization.
     */
    private final List<Configuration> dynamicConfigurations = new ArrayList<>();

    private final ConfigManager configManager;
    // OidcConfiguration implements javax.security.auth.login.Configuration, but let's keep it separate from
    // this.configuration field
    private OidcConfiguration oidcConfiguration;

    /**
     * Flag indicating that Spring Security is not only available, but proper {@code SecurityFilterChain} was
     * configured in web application context.
     */
    private boolean springSecurityEnabled = false;

    /**
     * Static helper to get a single {@link AuthenticationConfiguration} configured in a Servlet environment.
     * @param servletContext
     * @return
     */
    public static AuthenticationConfiguration getConfiguration(ServletContext servletContext) {
        AuthenticationConfiguration authConfig = (AuthenticationConfiguration) servletContext.getAttribute(AUTHENTICATION_CONFIGURATION);
        if (authConfig == null) {
            authConfig = new AuthenticationConfiguration(servletContext);
            servletContext.setAttribute(AUTHENTICATION_CONFIGURATION, authConfig);
        }
        return authConfig;
    }

    /**
     * Private constructor used by {@link #getConfiguration}
     *
     * @param servletContext
     */
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
        this.keycloakEnabled = this.enabled && config.getBoolean(KEYCLOAK_ENABLED, false);
        this.noCredentials401 = config.getBoolean(NO_CREDENTIALS_401, false);

        if (!this.enabled) {
            // no need to configure anything more
            initialized = true;
            LOG.info("Starting hawtio authentication filter, JAAS authentication disabled");
            return;
        }

        // role names expected in the authenticated Subject's getPrincipals()
        // from -Dhawtio.role (because we have this in the docs...
        config.get(ROLE).ifPresent(r -> {
            if (!r.isBlank()) {
                List<String> deprecatedRoleFromRole = Arrays.asList(r.split("\\s*,\\s*"));
                this.roles.addAll(deprecatedRoleFromRole.stream().filter(r2 -> !r2.isBlank()).toList());
            }
        });
        // from -Dhawtio.roles - has default "admin,manager,viewer"
        String roleNames = config.get(ROLES).orElse(DEFAULT_KARAF_ROLES);
        List<String> roleValues = Arrays.asList(roleNames.split("\\s*,\\s*"));
        this.roles.addAll(roleValues.stream().filter(r -> !r.isBlank()).toList());
        if (roles.contains("*")) {
            // accepting "all roles" means that Hawtio is skipping the authorization part, but we still
            // authenticate the subject and populate the roles, so the subject can be authenticated in the
            // deployment environment (like Artemis)
            LOG.debug("Hawtio authorization is disabled when using wildcard \"*\" role. Authentication is still performed.");
        }

        // throttling - may be disabled later when OIDC, Keycloak or Spring Security is detected.
        boolean throttled = config.getBoolean(AUTHENTICATION_THROTTLED, true);
        LOG.info("Authentication throttling is {}", throttled ? "enabled" : "disabled");
        this.throttler = throttled ? new AuthenticationThrottler() : null;

        // java.security.Principal class names checked in Subject.getPrincipals()
        // 1. from known environment
        if (isKaraf()) {
            this.rolePrincipalClassNames.addAll(DEFAULT_KARAF_ROLE_PRINCIPAL_CLASSES);
        }
        // 2. from external configuration of -Dhawtio.rolePrincipalClasses, for example
        //    Artemis uses -Dhawtio.rolePrincipalClasses=org.apache.activemq.artemis.spi.core.security.jaas.RolePrincipal
        config.get(ROLE_PRINCIPAL_CLASSES).ifPresent(option
                -> this.rolePrincipalClassNames.addAll(Arrays.asList(option.split("\\s*,\\s*"))));
        // 3. if Keycloak is enabled we add known class name
        if (keycloakEnabled) {
            this.rolePrincipalClassNames.add("org.keycloak.KeycloakPrincipal");
            this.rolePrincipalClassNames.add("org.keycloak.adapters.jaas.RolePrincipal");
        }

        // Use container discovery, so we can get dynamic JAAS configurations and additional principal classes
        String authDiscoveryClasses = config.get(AUTHENTICATION_CONTAINER_DISCOVERY_CLASSES).orElse(null);
        List<AuthenticationContainerDiscovery> discoveries;
        if (authDiscoveryClasses == null) {
            // user didn't configure -Dhawtio.authenticationContainerDiscoveryClasses at all
            discoveries = builtInIntegrations;
        } else {
            // user specified -Dhawtio.authenticationContainerDiscoveryClasses, potentially with empty value
            // which is used to disable built-in discovery classes
            discoveries = getDiscoveries(authDiscoveryClasses);
        }
        for (AuthenticationContainerDiscovery discovery : discoveries) {
            if (discovery.registerContainerAuthentication(this)) {
                LOG.info("Discovered container {} to use with hawtio authentication filter", discovery.getContainerName());
                // don't break, continue with other discovery services.
            }
        }

        LOG.info("Starting Hawtio authentication filter, JAAS realm: \"{}\"" +
                        " authorized role(s): {}, role principal class names: {}",
                this.realm, String.join(", ", this.roles), String.join(", ", this.rolePrincipalClassNames));
    }

    /**
     * After creating the {@link AuthenticationConfiguration} we may call some other configuration methods like:<ul>
     *     <li>{@link #addConfiguration}</li>
     *     <li>{@link #addRolePrincipalClassName}</li>
     *     <li>{@link #configureOidc}</li>
     * </ul>
     * So it is important to highlight an end of the configuration, so some important defaults can be calculated.
     */
    public void initializationComplete(ServletContext context) {
        if (!enabled) {
            return;
        }

        // if authentication is not disabled, it is a responsibility of the "deployer" to allow authenticated
        // access to Jolokia. This is a scenario, where Hawtio+Jolokia can act as remote Jolokia Agent which
        // can be accessed from other Hawtio instances.
        // for now we don't support fancy authentication schemes when accessing the Jolokia agent configured
        // by Hawtio itself, but it may change in the future
        // see https://github.com/hawtio/hawtio/issues/2941
        //
        // set a flag for Jolokia's Agent servlet, so it can return supported authentication method
        // using /jolokia/config endpoint (new in 2.4.0)
        context.setAttribute(AgentServlet.EXTERNAL_BASIC_AUTH_REALM, realm);

        // some services (Tomcat discovery, OIDC, Spring Boot + Spring Security) may have added extra
        // JAAS configurations. We will now combine all Login Modules in a single configuration under
        // Hawtio realm == JAAS Application name. Default login modules (from -Djava.security.auth.login.config)
        // we'll be used as fallback modules.

        Configuration defaultJAASConfig = Configuration.getConfiguration();
        AppConfigurationEntry[] defaultEntries = defaultJAASConfig == null ? null : defaultJAASConfig.getAppConfigurationEntry(realm);

        List<AppConfigurationEntry> mergedEntries = new ArrayList<>();

        // now here's a decision to make and situation to be aware of. If user has explicitly configured OIDC login
        // module or Spring Security (with org.springframework.security.authentication.jaas.SecurityContextLoginModule)
        // but also used -Djava.security.auth.login.config with some login modules, we need to be sure that
        // SUFFICIENT flag is used instead of REQUIRED - at least for the dynamic configurations.
        // user may decided to use whatever flag in login.config file

        for (Configuration jaasConfig : this.dynamicConfigurations) {
            // Hawtio itself prepares the Configurations without bothering with "application entry name" anyway
            // but we pass a realm here
            AppConfigurationEntry[] entries = jaasConfig.getAppConfigurationEntry(realm);
            Collections.addAll(mergedEntries, entries);
        }

        // and add defaults (from -Djava.security.auth.login.config) at the end
        if (defaultEntries != null) {
            Collections.addAll(mergedEntries, defaultEntries);
        }

        final AppConfigurationEntry[] allLoginModules = mergedEntries.toArray(AppConfigurationEntry[]::new);

        this.configuration = new Configuration() {
            @Override
            public AppConfigurationEntry[] getAppConfigurationEntry(String name) {
                return allLoginModules;
            }
        };

        // search through login modules and add known principal classes
        for (AppConfigurationEntry lm : allLoginModules) {
            String className = lm.getLoginModuleName();
            if ("io.hawt.jetty.security.jaas.PropertyFileLoginModule".equals(className)) {
                rolePrincipalClassNames.add("org.eclipse.jetty.security.jaas.JAASPrincipal");
                rolePrincipalClassNames.add("org.eclipse.jetty.security.jaas.JAASRole");
                rolePrincipalClassNames.add("org.eclipse.jetty.security.UserPrincipal");
            }
            if ("com.sun.security.auth.module.LdapLoginModule".equals(className)) {
                rolePrincipalClassNames.add("com.sun.security.auth.LdapPrincipal");
                rolePrincipalClassNames.add("com.sun.security.auth.UserPrincipal");
            }
        }

        // 5. finally add last (fallback) role name class to use
        rolePrincipalClassNames.add(RolePrincipal.class.getName());

        // now we can verify if the added Principal class names are actually loadable
        List<Class<Principal>> knownPrincipalClasses = new ArrayList<>(rolePrincipalClassNames.size());
        for (String className : rolePrincipalClassNames) {
            Class<Principal> clz = tryLoadClass(className, Principal.class);
            if (clz != null) {
                // reachable, loadable, but not necessarily with 1-arg String constructor
                knownPrincipalClasses.add(clz);
            }
        }
        this.rolePrincipalClasses = Collections.unmodifiableList(knownPrincipalClasses);

        // we need one Principal class to use as role for Hawtio itself. will use it in own Login modules (like OIDC)
        this.defaultRolePrincipalClass = determineDefaultRolePrincipalClass();

        initialized = true;
    }

    private static boolean isKaraf() {
        return System.getProperty("karaf.name") != null;
    }

    /**
     * Locate {@link TomcatAuthenticationContainerDiscovery} services to do some security configuration
     * specific to deployment environment.
     *
     * @param authDiscoveryClasses
     * @return
     */
    private static List<AuthenticationContainerDiscovery> getDiscoveries(String authDiscoveryClasses) {
        List<AuthenticationContainerDiscovery> discoveries = new ArrayList<>();
        if (authDiscoveryClasses == null || authDiscoveryClasses.trim().isEmpty()) {
            return discoveries;
        }

        String[] discoveryClasses = authDiscoveryClasses.split("\\s*,\\s*");
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

    /**
     * Is authentication enabled at all? When {@code false} both authentication and authorization is disabled.
     * @return
     */
    public boolean isEnabled() {
        return enabled;
    }

    public Optional<AuthenticationThrottler> getThrottler() {
        // Throttling should be disabled when OIDC or Keycloak or Spring Security is used
        if (isExternalAuthenticationEnabled()) {
            return Optional.empty();
        }
        return Optional.of(throttler);
    }

    public boolean isNoCredentials401() {
        return noCredentials401;
    }

    /**
     * Get Hawtio's <em>realm</em> which may mean BASIC authentication realm or JAAS application entry.
     * @return
     */
    public String getRealm() {
        return realm;
    }

    /**
     * Get a list of supported (recognized, expected) role names. When this list is empty, authorization
     * is effectively disabled (and only authentication is performed).
     *
     * @return
     */
    public List<String> getRoles() {
        return roles;
    }

    /**
     * Dynamic configurations may add extra {@link Principal} class names to be supported (recognized) by Hawtio
     *
     * @param rolePrincipalClassName
     */
    public void addRolePrincipalClassName(String rolePrincipalClassName) {
        this.rolePrincipalClassNames.add(rolePrincipalClassName);
    }

    /**
     * Return default {@link Class} of {@link Principal} to be used by Hawtio in own
     * {@link javax.security.auth.spi.LoginModule login modules}.
     *
     * @return
     */
    public Class<? extends Principal> getDefaultRolePrincipalClass() {
        return defaultRolePrincipalClass;
    }

    /**
     * Ger a list of <em>all</em> supported {@link Principal} classes
     *
     * @return
     */
    public List<Class<Principal>> getRolePrincipalClasses() {
        return rolePrincipalClasses;
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    /**
     * <p>Add dynamic {@link Configuration JAAS configuration} object to be used in addition to static JAAS
     * configuration.</p>
     *
     * <p>Normally Hawtio uses JAAS with default settings, where JAAS configuration file is configured with
     * {@code -Djava.security.auth.login.config} option. However when configuring more complex
     * {@link javax.security.auth.spi.LoginModule JAAS login modules}, static configuration file is not sufficient
     * and we need dynamically configuration {@link AppConfigurationEntry JAAS configuration entries}.</p>
     *
     * @param configuration
     */
    public void addConfiguration(Configuration configuration) {
        dynamicConfigurations.add(configuration);
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
                this.oidcConfiguration = new OidcConfiguration(this.realm, props);
                this.oidcConfiguration.setRolePrincipalClass(defaultRolePrincipalClass);
                if (this.oidcConfiguration.isEnabled()) {
                    addConfiguration(this.oidcConfiguration);
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
     * Process configured {@link Principal} class names and returns first that's available and has
     * proper (1-arg String) constructor.
     *
     * @return
     */
    private Class<? extends Principal> determineDefaultRolePrincipalClass() {
        if (rolePrincipalClasses.isEmpty()) {
            return null;
        }

        Class<? extends Principal> roleClass = null;

        // let's load first available class - needs 1-arg String constructor
        for (Class<Principal> clz : this.rolePrincipalClasses) {
            try {
                Constructor<?> ctr = clz.getConstructor(String.class);
                roleClass = clz;
            } catch (NoSuchMethodException e) {
                LOG.warn("Can't use role principal class {}: {}", clz.getName(), e.getMessage());
            }
        }

        return roleClass;
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
            ", rolePrincipalClasses='" + String.join(", ", rolePrincipalClassNames) + '\'' +
            ", configuration=" + configuration +
            ", keycloakEnabled=" + keycloakEnabled +
            ", oidcEnabled=" + (oidcConfiguration != null && oidcConfiguration.isEnabled()) +
            ']';
    }

}
