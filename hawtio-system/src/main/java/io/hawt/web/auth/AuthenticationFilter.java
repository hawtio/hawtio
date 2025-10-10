package io.hawt.web.auth;

import java.io.IOException;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;

import javax.security.auth.Subject;

import io.hawt.web.ForbiddenReason;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;
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

    protected AuthenticationConfiguration authConfiguration;

    /**
     * Number of path segments to skip to get <em>Hawtio path</em> (e.g., skip 2 segments for
     * {@code /actuator/hawtio}).
     */
    private int pathIndex;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        ServletContext servletContext = filterConfig.getServletContext();
        authConfiguration = AuthenticationConfiguration.getConfiguration(servletContext);
        pathIndex = ServletHelpers.hawtioPathIndex(servletContext);
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // CORS preflight requests should be ignored
        if ("OPTIONS".equals(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = httpRequest.getServletPath();

        LOG.debug("Handling request for path: {}", path);

        if (!authConfiguration.isEnabled() || authConfiguration.getRealm() == null || authConfiguration.getRealm().isEmpty()) {
            LOG.debug("No authentication needed for path: {}", path);
            chain.doFilter(request, response);
            return;
        }

        ProxyRequestType proxyMode = isProxyMode(httpRequest);

        if (proxyMode == ProxyRequestType.PROXY_ENABLED) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);

        if (proxyMode == ProxyRequestType.PROXY && session == null) {
            if (!authConfiguration.isExternalAuthenticationEnabled()) {
                // simple - we need a session, we don't have one
                // we reject proxy requests without session, because Authorization header is targeted at remote Jolokia
                ServletHelpers.doForbidden(httpResponse, ForbiddenReason.SESSION_EXPIRED);
                return;
            }
        }

        if (session != null) {
            // this attribute can be set by calling
            // io.hawt.web.auth.AuthSessionHelpers.setup():
            //  - in io.hawt.web.auth.LoginServlet.doPost() after authentication using JAAS
            //  - in io.hawt.quarkus.servlets.HawtioQuakusLoginServlet.doPost() after authentication using
            //    io.quarkus.security.identity.IdentityProviderManager.authenticateBlocking()
            //  - in io.hawt.web.auth.ClientRouteRedirectFilter.tryAuthenticateRequest()
            Subject subject = (Subject) session.getAttribute("subject");

            // No special Spring Security handling here, because we now use proper JAAS configuration
            // and Spring Security Authentication will be translated to JAAS Subject + Principals

            // When user is authenticated in Hawtio (has session) and uses /proxy, we can't match
            // current subject/name (from session) with Authorization header as this one is for remote Jolokia
            // we only require a subject to be present in session
            if (proxyMode == ProxyRequestType.PROXY) {
                if (subject != null || ((HttpServletRequest) request).getUserPrincipal() != null) {
                    chain.doFilter(request, response);
                } else {
                    ServletHelpers.doForbidden(httpResponse);
                }
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

        // JAAS authentication
        AuthenticateResult result = new Authenticator(httpRequest, authConfiguration).authenticate(
            subject -> executeAs(request, response, chain, subject));

        switch (result.getType()) {
        case AUTHORIZED:
            // request was already executed using the authenticated subject in executeAs(), nothing more to do
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

    protected ProxyRequestType isProxyMode(HttpServletRequest httpRequest) {
        ProxyRequestType proxyMode = ProxyRequestType.NOT_PROXY;
        RelativeRequestUri uri = new RelativeRequestUri(httpRequest, pathIndex);
        if (uri.getComponents().length > 0 && "proxy".equals(uri.getComponents()[0])) {
            // https://github.com/hawtio/hawtio/issues/3178
            // /proxy/* requests are now authenticated by this filter, but we have to do it differently, because
            // "Authorization" header carries credentials for target Jolokia agent
            proxyMode = uri.getUri().equals("proxy/enabled") ? ProxyRequestType.PROXY_ENABLED : ProxyRequestType.PROXY;
        }
        return proxyMode;
    }

    private static void executeAs(final ServletRequest request, final ServletResponse response, final FilterChain chain, Subject subject) {
        try {
            Subject.doAs(subject, (PrivilegedExceptionAction<Object>) () -> {
                chain.doFilter(request, response);
                return null;
            });
        } catch (PrivilegedActionException e) {
            LOG.info("Failed to handle {} due to:", ((HttpServletRequest) request).getRequestURI(), e.getCause());
        }
    }

    @Override
    public void destroy() {
        LOG.info("Destroying hawtio authentication filter");
    }

    protected enum ProxyRequestType {
        PROXY, PROXY_ENABLED, NOT_PROXY
    }
}
