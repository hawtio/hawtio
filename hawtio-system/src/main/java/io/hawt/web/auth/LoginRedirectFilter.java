package io.hawt.web.auth;

import java.io.IOException;
import java.util.Arrays;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.system.AuthHelpers;
import io.hawt.system.AuthenticateResult;
import io.hawt.system.Authenticator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Redirect to login page when authentication is enabled.
 */
public class LoginRedirectFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(LoginRedirectFilter.class);

    public final String ATTRIBUTE_UNSECURED_PATHS = "unsecuredPaths";

    private int timeout;
    private AuthenticationConfiguration authConfiguration;

    private String[] unsecuredPaths;

    private Redirector redirector = new Redirector();

    public LoginRedirectFilter() {
        this(AuthenticationConfiguration.UNSECURED_PATHS);
    }

    public LoginRedirectFilter(String[] unsecuredPaths) {
        this.unsecuredPaths = unsecuredPaths;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());
        timeout = AuthSessionHelpers.getSessionTimeout(filterConfig.getServletContext());
        LOG.info("Hawtio loginRedirectFilter is using {} sec. HttpSession timeout", timeout);

        Object unsecured = filterConfig.getServletContext().getAttribute(ATTRIBUTE_UNSECURED_PATHS);
        if (unsecured != null) {
            unsecuredPaths = (String[]) unsecured;
        }
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);
        String path = httpRequest.getServletPath();

        if (isRedirectRequired(session, path, httpRequest)) {
            redirector.doRedirect(httpRequest, httpResponse, AuthenticationConfiguration.LOGIN_URL);
        } else {
            chain.doFilter(request, response);
        }
    }

    private boolean isRedirectRequired(HttpSession session, String path, HttpServletRequest request) {
        return authConfiguration.isEnabled()
            && !authConfiguration.isKeycloakEnabled()
            && !AuthSessionHelpers.isSpringSecurityEnabled()
            && !AuthSessionHelpers.isAuthenticated(session)
            && isSecuredPath(path)
            && !tryAuthenticateRequest(request, session);
    }

    boolean tryAuthenticateRequest(HttpServletRequest request, HttpSession session) {
        AuthenticateResult result = new Authenticator(request, authConfiguration).authenticate(
            subject -> {
                String username = AuthHelpers.getUsername(subject);
                LOG.info("Logging in user: {}", username);
                AuthSessionHelpers.setup(session != null ? session :
                    request.getSession(true), subject, username, timeout);
            });

        return result == AuthenticateResult.AUTHORIZED;
    }

    boolean isSecuredPath(String path) {
        return Arrays.stream(unsecuredPaths).noneMatch(path::startsWith);
    }

    @Override
    public void destroy() {
    }

    public void setRedirector(Redirector redirector) {
        this.redirector = redirector;
    }
}
