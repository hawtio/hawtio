package io.hawt.web;

import java.io.IOException;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;
import java.util.ArrayList;
import java.util.List;
import javax.security.auth.Subject;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import io.hawt.system.Authenticator;
import io.hawt.system.ConfigManager;
import io.hawt.system.Helpers;
import io.hawt.system.PrivilegedCallback;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Filter for authentication. If the filter is enabled, then the login screen is shown.
 */
public class AuthenticationFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(AuthenticationFilter.class);

    // JVM system properties
    public static final String HAWTIO_NO_CREDENTIALS_401 = "hawtio.noCredentials401";
    public static final String HAWTIO_AUTHENTICATION_ENABLED = "hawtio.authenticationEnabled";
    public static final String HAWTIO_REALM = "hawtio.realm";
    public static final String HAWTIO_ROLE = "hawtio.role";
    public static final String HAWTIO_ROLES = "hawtio.roles";
    public static final String HAWTIO_ROLE_PRINCIPAL_CLASSES = "hawtio.rolePrincipalClasses";
    public static final String HAWTIO_AUTH_CONTAINER_DISCOVERY_CLASSES = "hawtio.authenticationContainerDiscoveryClasses";

    private final AuthenticationConfiguration configuration = new AuthenticationConfiguration();

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        ConfigManager config = (ConfigManager) filterConfig.getServletContext().getAttribute("ConfigManager");

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
                roles = "admin,viewer";
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

        filterConfig.getServletContext().setAttribute("authenticationEnabled", configuration.isEnabled());

        if (configuration.isEnabled()) {
            LOG.info("Starting hawtio authentication filter, JAAS realm: \"{}\" authorized role(s): \"{}\" role principal classes: \"{}\"",
                    new Object[]{configuration.getRealm(), configuration.getRole(), configuration.getRolePrincipalClasses()});
        } else {
            LOG.info("Starting hawtio authentication filter, JAAS authentication disabled");
        }
    }

    protected List<AuthenticationContainerDiscovery> getDiscoveries(String authDiscoveryClasses) {
        List<AuthenticationContainerDiscovery> discoveries = new ArrayList<AuthenticationContainerDiscovery>();
        if (authDiscoveryClasses == null || authDiscoveryClasses.trim().isEmpty()) {
            return discoveries;
        }

        String[] discoveryClasses = authDiscoveryClasses.split(",");
        for (String discoveryClass : discoveryClasses) {
            try {
                // Should have more clever classloading?
                Class<? extends AuthenticationContainerDiscovery> clazz = (Class<? extends AuthenticationContainerDiscovery>) getClass().getClassLoader().loadClass(discoveryClass.trim());
                AuthenticationContainerDiscovery discovery = clazz.newInstance();
                discoveries.add(discovery);
            } catch (Exception e) {
                LOG.warn("Couldn't instantiate discovery " + discoveryClass, e);
            }
        }
        return discoveries;
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getServletPath();
        LOG.debug("Handling request for path {}", path);

        if (configuration.getRealm() == null || configuration.getRealm().equals("") || !configuration.isEnabled()) {
            LOG.debug("No authentication needed for path {}", path);
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            Subject subject = (Subject) session.getAttribute("subject");
            if (subject != null) {
                LOG.debug("Session subject {}", subject);
                executeAs(request, response, chain, subject);
                return;
            }
        }

        LOG.debug("Doing authentication and authorization for path {}", path);
        switch (Authenticator.authenticate(configuration.getRealm(), configuration.getRole(), configuration.getRolePrincipalClasses(),
                configuration.getConfiguration(), httpRequest, new PrivilegedCallback() {
                    public void execute(Subject subject) throws Exception {
                        executeAs(request, response, chain, subject);
                    }
                }
        )) {
            case AUTHORIZED:
                // request was executed using the authenticated subject, nothing more to do
                break;
            case NOT_AUTHORIZED:
                Helpers.doForbidden((HttpServletResponse) response);
                break;
            case NO_CREDENTIALS:
                if (configuration.isNoCredentials401()) {
                    // return auth prompt 401
                    Helpers.doAuthPrompt(configuration.getRealm(), (HttpServletResponse) response);
                } else {
                    // return forbidden 403 so the browser login does not popup
                    Helpers.doForbidden((HttpServletResponse) response);
                }
                break;
        }
    }

    private static void executeAs(final ServletRequest request, final ServletResponse response, final FilterChain chain, Subject subject) {
        try {
            Subject.doAs(subject, new PrivilegedExceptionAction<Object>() {
                @Override
                public Object run() throws Exception {
                    chain.doFilter(request, response);
                    return null;
                }
            });
        } catch (PrivilegedActionException e) {
            LOG.info("Failed to invoke action " + ((HttpServletRequest) request).getPathInfo() + " due to:", e);
        }
    }

    @Override
    public void destroy() {
        LOG.info("Destroying hawtio authentication filter");
    }
}
