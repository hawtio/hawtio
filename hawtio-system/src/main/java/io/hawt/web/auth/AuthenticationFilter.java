package io.hawt.web.auth;

import io.hawt.system.AuthInfo;
import io.hawt.system.AuthenticateResult;
import io.hawt.system.Authenticator;
import io.hawt.web.ServletHelpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.security.auth.Subject;
import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;

/**
 * Filter for authentication. If the filter is enabled, then the login screen is shown.
 */
public class AuthenticationFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(AuthenticationFilter.class);

    private AuthenticationConfiguration authConfiguration;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getServletPath();

        LOG.debug("Handling request for path {}", path);

        if (authConfiguration.getRealm() == null || authConfiguration.getRealm().equals("") || !authConfiguration.isEnabled()) {
            LOG.debug("No authentication needed for path {}", path);
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            Subject subject = (Subject) session.getAttribute("subject");
            // Connecting from another Hawtio may have a different user authentication, so
            // let's check if the session user is the same as in the authorization header here
            if (subject != null && validateSession(httpRequest, session, subject)) {
                executeAs(request, response, chain, subject);
                return;
            }
        }

        LOG.debug("Doing authentication and authorization for path {}", path);

        AuthenticateResult result = Authenticator.authenticate(
            authConfiguration, httpRequest,
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

    private boolean validateSession(HttpServletRequest request, HttpSession session, Subject subject) {
        String authHeader = request.getHeader(Authenticator.HEADER_AUTHORIZATION);
        AuthInfo info = new AuthInfo();
        if (authHeader != null && !authHeader.equals("")) {
            Authenticator.extractAuthInfo(authHeader, (userName, password) -> info.username = userName);
        }
        String sessionUser = (String) session.getAttribute("user");
        if (info.username == null || info.username.equals(sessionUser)) {
            LOG.debug("Session subject - {}", subject);
            return true;
        } else {
            LOG.debug("User differs, re-authenticating: {} (request) != {} (session)", info.username, sessionUser);
            session.invalidate();
            return false;
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
