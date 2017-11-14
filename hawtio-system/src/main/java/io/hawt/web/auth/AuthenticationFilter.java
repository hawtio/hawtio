package io.hawt.web.auth;

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

import io.hawt.system.AuthInfo;
import io.hawt.system.AuthenticateResult;
import io.hawt.system.Authenticator;
import io.hawt.system.ConfigManager;
import io.hawt.web.ServletHelpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Filter for authentication. If the filter is enabled, then the login screen is shown.
 */
public class AuthenticationFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(AuthenticationFilter.class);

    private AuthenticationConfiguration configuration;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        configuration = ConfigurationManager.getConfiguration(filterConfig.getServletContext());
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
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
            // Connecting from another Hawtio may have a different user authentication, so
            // let's check if the session user is the same as in the authorization header here
            if (subject != null && validateSession(httpRequest, session, subject)) {
                executeAs(request, response, chain, subject);
                return;
            }
        }

        LoginRedirectFilter.redirect(httpRequest, httpResponse);

//        LOG.debug("Doing authentication and authorization for path {}", path);
//        AuthenticateResult result = Authenticator.authenticate(
//            configuration.getRealm(),
//            configuration.getRole(),
//            configuration.getRolePrincipalClasses(),
//            configuration.getConfiguration(),
//            httpRequest,
//            subject -> executeAs(request, response, chain, subject));
//        HttpServletResponse httpResponse = (HttpServletResponse) response;
//        switch (result) {
//            case AUTHORIZED:
//                // request was executed using the authenticated subject, nothing more to do
//                break;
//            case NOT_AUTHORIZED:
//                ServletHelpers.doForbidden(httpResponse);
//                break;
//            case NO_CREDENTIALS:
//                if (configuration.isNoCredentials401()) {
//                    // return auth prompt 401
//                    ServletHelpers.doAuthPrompt(configuration.getRealm(), httpResponse);
//                } else {
//                    // return forbidden 403 so the browser login does not popup
//                    ServletHelpers.doForbidden(httpResponse);
//                }
//                break;
//        }
    }

    private boolean validateSession(HttpServletRequest request, HttpSession session, Subject subject) {
//        String authHeader = request.getHeader(Authenticator.HEADER_AUTHORIZATION);
//        AuthInfo info = new AuthInfo();
//        if (authHeader != null && !authHeader.equals("")) {
//            Authenticator.extractAuthInfo(authHeader, (userName, password) -> info.username = userName);
//        }
//        String sessionUser = (String) session.getAttribute("user");
//        if (info.username == null || info.username.equals(sessionUser)) {
//            LOG.debug("Session subject - {}", subject);
//            return true;
//        } else {
//            LOG.debug("User differs, re-authenticating: {} (request) != {} (session)", info.username, sessionUser);
//            session.invalidate();
//            return false;
//        }
        return true;
    }

    private static void executeAs(final ServletRequest request, final ServletResponse response, final FilterChain chain, Subject subject) {
        try {
            if (System.getProperty("jboss.server.name") != null) {
                // WildFly / JBoss EAP currently do not support in-vm privileged action with subject
                LOG.debug("Running on WildFly / JBoss EAP. Directly invoking filter chain instead of privileged action");
                request.setAttribute("subject", subject);
                chain.doFilter(request, response);
                return;
            }
            Subject.doAs(subject, (PrivilegedExceptionAction<Object>) () -> {
                chain.doFilter(request, response);
                return null;
            });
        } catch (ServletException | IOException | PrivilegedActionException e) {
            LOG.info("Failed to invoke action " + ((HttpServletRequest) request).getPathInfo() + " due to:", e);
        }
    }

    @Override
    public void destroy() {
        LOG.info("Destroying hawtio authentication filter");
    }
}
