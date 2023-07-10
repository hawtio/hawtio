package io.hawt.web.auth;

import java.io.IOException;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;

import javax.security.auth.Subject;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.system.AuthenticateResult;
import io.hawt.system.Authenticator;
import io.hawt.web.ServletHelpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Filter for authentication. If the filter is enabled, then the login screen is shown.
 * <p>
 * This filter is used to provide authentication for direct access to Jolokia endpoint.
 */
public class AuthenticationFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationFilter.class);

    protected int timeout;
    protected AuthenticationConfiguration authConfiguration;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());
        timeout = AuthSessionHelpers.getSessionTimeout(filterConfig.getServletContext());
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getServletPath();

        LOG.debug("Handling request for path: {}", path);

        if (authConfiguration.getRealm() == null || authConfiguration.getRealm().equals("") || !authConfiguration.isEnabled()) {
            LOG.debug("No authentication needed for path: {}", path);
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            Subject subject = (Subject) session.getAttribute("subject");

            // For Spring Security
            if (AuthSessionHelpers.isSpringSecurityEnabled()) {
                if (subject == null && httpRequest.getRemoteUser() != null) {
                    AuthSessionHelpers.setup(
                        session, new Subject(), httpRequest.getRemoteUser(), timeout);
                }
                chain.doFilter(request, response);
                return;
            }

            // Connecting from another Hawtio may have a different user authentication, so
            // let's check if the session user is the same as in the authorization header here
            if (AuthSessionHelpers.validate(httpRequest, session, subject)) {
                executeAs(request, response, chain, subject);
                return;
            }
        }

        LOG.debug("Doing authentication and authorization for path: {}", path);

        AuthenticateResult result = new Authenticator(httpRequest, authConfiguration).authenticate(
            subject -> executeAs(request, response, chain, subject));

        HttpServletResponse httpResponse = (HttpServletResponse) response;
        switch (result) {
        case AUTHORIZED:
            // request was executed using the authenticated subject, nothing more to do
            break;
        case NOT_AUTHORIZED:
            ServletHelpers.doForbidden(httpResponse);
            break;
        case NO_CREDENTIALS:
            if (authConfiguration.isNoCredentials401()) {
                // return auth prompt 401
                ServletHelpers.doAuthPrompt(authConfiguration.getRealm(), httpResponse);
            } else {
                // return forbidden 403 so the browser login does not popup
                ServletHelpers.doForbidden(httpResponse);
            }
            break;
        }
    }

    private static void executeAs(final ServletRequest request, final ServletResponse response, final FilterChain chain, Subject subject) {
        try {
            Subject.doAs(subject, (PrivilegedExceptionAction<Object>) () -> {
                chain.doFilter(request, response);
                return null;
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
