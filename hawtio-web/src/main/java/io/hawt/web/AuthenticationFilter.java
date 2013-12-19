package io.hawt.web;

import java.io.IOException;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;
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
import io.hawt.web.tomcat.TomcatLoginContextConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Filter for authentication. If the filter is enabled, then the login screen is shown.
 */
public class AuthenticationFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(AuthenticationFilter.class);

    // JVM system properties
    public static final String HAWTIO_AUTHENTICATION_ENABLED = "hawtio.authenticationEnabled";
    public static final String HAWTIO_REALM = "hawtio.realm";
    public static final String HAWTIO_ROLE = "hawtio.role";
    public static final String HAWTIO_ROLE_PRINCIPAL_CLASSES = "hawtio.rolePrincipalClasses";

    private final AuthenticationConfiguration configuration = new AuthenticationConfiguration();

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        ConfigManager config = (ConfigManager) filterConfig.getServletContext().getAttribute("ConfigManager");
        if (config != null) {
            configuration.setRealm(config.get("realm", "karaf"));
            configuration.setRole(config.get("role", "admin"));
            configuration.setRolePrincipalClasses(config.get("rolePrincipalClasses", ""));
            configuration.setEnabled(Boolean.parseBoolean(config.get("authenticationEnabled", "true")));
        }

        // JVM system properties can override always
        if (System.getProperty(HAWTIO_AUTHENTICATION_ENABLED) != null) {
            configuration.setEnabled(Boolean.getBoolean(HAWTIO_AUTHENTICATION_ENABLED));
        }
        if (System.getProperty(HAWTIO_REALM) != null) {
            configuration.setRealm(System.getProperty(HAWTIO_REALM));
        }
        if (System.getProperty(HAWTIO_ROLE) != null) {
            configuration.setRole(System.getProperty(HAWTIO_ROLE));
        }
        if (System.getProperty(HAWTIO_ROLE_PRINCIPAL_CLASSES) != null) {
            configuration.setRolePrincipalClasses(System.getProperty(HAWTIO_ROLE_PRINCIPAL_CLASSES));
        }

        // TODO: Introduce a discovery spi so we can try to figure out which runtime is in use, and auto-setup
        // security accordingly, such as for Tomcat

        // or infer using tomcat as realm name, or have tomcat-user-database as the realm name as convention or something
        // if we use tomcat as realm then use the tomcat principal class if not set
        if ("tomcat".equals(configuration.getRealm()) && "".equals(configuration.getRolePrincipalClasses())) {
            configuration.setRolePrincipalClasses("io.hawt.web.tomcat.TomcatPrincipal");
            configuration.setConfiguration(new TomcatLoginContextConfiguration());
        }

        if (LOG.isDebugEnabled()) {
            LOG.debug("Initializing AuthenticationFilter {}", configuration);
        }

        if (configuration.isEnabled()) {
            LOG.info("Starting hawtio authentication filter, JAAS realm: \"{}\" authorized role: \"{}\" role principal classes: \"{}\"",
                    new Object[]{configuration.getRealm(), configuration.getRole(), configuration.getRolePrincipalClasses()});
        } else {
            LOG.info("Starting hawtio authentication filter, JAAS authentication disabled");
        }
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        if (configuration.getRealm() == null || configuration.getRealm().equals("") || !configuration.isEnabled()) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpSession session = httpRequest.getSession(false);

        LOG.debug("Handling request for path {}", httpRequest.getServletPath());

        if (session != null) {
            Subject subject = (Subject) session.getAttribute("subject");
            if (subject != null) {
                executeAs(request, response, chain, subject);
                return;
            }
        }

        String path = httpRequest.getServletPath();

        boolean doAuthenticate = path.startsWith("/auth") ||
                path.startsWith("/jolokia") ||
                path.startsWith("/upload");

        if (doAuthenticate) {
            LOG.debug("Doing authentication and authorization for path {}", path);
            switch (Authenticator.authenticate(configuration.getRealm(), configuration.getRole(), configuration.getRolePrincipalClasses(),
                    configuration.getConfiguration(), httpRequest, new PrivilegedCallback() {
                public void execute(Subject subject) throws Exception {
                    executeAs(request, response, chain, subject);
                }
            })) {
                case AUTHORIZED:
                    // request was executed using the authenticated subject, nothing more to do
                    break;
                case NOT_AUTHORIZED:
                    Helpers.doForbidden((HttpServletResponse) response);
                    break;
                case NO_CREDENTIALS:
                    //doAuthPrompt((HttpServletResponse)response);
                    Helpers.doForbidden((HttpServletResponse) response);
                    break;
            }
        } else {
            chain.doFilter(request, response);
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
