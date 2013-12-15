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

    private String realm;
    private String role;
    private boolean enabled;
    private String rolePrincipalClasses;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

        ConfigManager config = (ConfigManager) filterConfig.getServletContext().getAttribute("ConfigManager");
        if (config != null) {
            realm = config.get("realm", "karaf");
            role = config.get("role", "admin");
            rolePrincipalClasses = config.get("rolePrincipalClasses", "");
            enabled = Boolean.parseBoolean(config.get("authenticationEnabled", "true"));
        }

        // JVM system properties can override always
        if (System.getProperty(HAWTIO_AUTHENTICATION_ENABLED) != null) {
            enabled = Boolean.getBoolean(HAWTIO_AUTHENTICATION_ENABLED);
        }
        if (System.getProperty(HAWTIO_REALM) != null) {
            realm = System.getProperty(HAWTIO_REALM);
        }
        if (System.getProperty(HAWTIO_ROLE) != null) {
            role = System.getProperty(HAWTIO_ROLE);
        }
        if (System.getProperty(HAWTIO_ROLE_PRINCIPAL_CLASSES) != null) {
            rolePrincipalClasses = System.getProperty(HAWTIO_ROLE_PRINCIPAL_CLASSES);
        }

        if (LOG.isDebugEnabled()) {
            LOG.debug("Initializing AuthenticationFilter [enabled:{}, realm={}, role={}, rolePrincipalClasses={}]", new Object[]{enabled, realm, role, rolePrincipalClasses});
        }

        if (enabled) {
            LOG.info("Starting hawtio authentication filter, JAAS realm: \"" + realm + "\" authorized role: \"" + role + "\"" + " role principal classes: \"" + rolePrincipalClasses + "\"");
        } else {
            LOG.info("Starting hawtio authentication filter, JAAS authentication disabled");
        }

    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {

        if (realm == null || realm.equals("") || !enabled) {
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
            switch (Authenticator.authenticate(realm, role, rolePrincipalClasses, httpRequest, new PrivilegedCallback() {
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
