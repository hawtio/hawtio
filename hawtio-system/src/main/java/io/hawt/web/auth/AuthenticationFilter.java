package io.hawt.web.auth;

import java.io.IOException;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;
import java.util.Collections;

import javax.security.auth.Subject;
import javax.security.auth.login.AppConfigurationEntry;

import io.hawt.util.Strings;
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

    private int pathIndex;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());
        timeout = AuthSessionHelpers.getSessionTimeout(filterConfig.getServletContext());
        this.pathIndex = Strings.hawtioPathIndex(filterConfig.getServletContext());
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // CORS preflight requests should be ignored
        if ("OPTIONS".equals(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = httpRequest.getServletPath();

        LOG.debug("Handling request for path: {}", path);

        if (authConfiguration.getRealm() == null || authConfiguration.getRealm().isEmpty() || !authConfiguration.isEnabled()) {
            LOG.debug("No authentication needed for path: {}", path);
            chain.doFilter(request, response);
            return;
        }

        boolean proxyMode = false;
        RelativeRequestUri uri = new RelativeRequestUri(httpRequest, pathIndex);
        if (uri.getComponents().length > 0 && "proxy".equals(uri.getComponents()[0])) {
            // https://github.com/hawtio/hawtio/issues/3178
            // /proxy/* requests are now authenticated by this filter, but we have to do it differently, because
            // "Authorization" header carries credentials for target Jolokia agent
            proxyMode = !uri.getUri().equals("proxy/enabled");
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
        switch (result.getType()) {
        case AUTHORIZED:
            // request was executed using the authenticated subject, nothing more to do
            break;
        case NOT_AUTHORIZED:
            ServletHelpers.doForbidden(httpResponse);
            break;
        case NO_CREDENTIALS:
            if (authConfiguration.isNoCredentials401()) {
                // return auth prompt 401
                ServletHelpers.doAuthPrompt(httpResponse, authConfiguration.getRealm());
            } else {
                // return forbidden 403 so the browser login does not popup
                ServletHelpers.doForbidden(httpResponse);
            }
            break;
        case THROTTLED:
            ServletHelpers.doTooManyRequests(httpResponse, result.getRetryAfter());
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
