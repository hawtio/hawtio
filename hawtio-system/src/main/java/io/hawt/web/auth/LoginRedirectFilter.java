package io.hawt.web.auth;

import java.io.IOException;
import java.util.Arrays;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Redirect to login page when authentication is enabled.
 */
public class LoginRedirectFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(LoginRedirectFilter.class);

    private AuthenticationConfiguration authConfiguration;

    private final String[] unsecuredPaths;

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
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);
        String path = httpRequest.getServletPath();

        if (isRedirectRequired(session, path)) {
            redirector.doRedirect(httpRequest, httpResponse, AuthenticationConfiguration.LOGIN_URL);
        } else {
            chain.doFilter(request, response);
        }
    }

    private boolean isRedirectRequired(HttpSession session, String path) {
        return authConfiguration.isEnabled()
            && !authConfiguration.isKeycloakEnabled()
            && !AuthSessionHelpers.isSpringSecurityEnabled()
            && !AuthSessionHelpers.isAuthenticated(session)
            && isSecuredPath(path);
    }

    boolean isSecuredPath(String path) {
        return !Arrays.stream(unsecuredPaths).anyMatch(path::startsWith);
    }

    @Override
    public void destroy() {
    }

    public void setRedirector(Redirector redirector) {
        this.redirector = redirector;
    }
}
