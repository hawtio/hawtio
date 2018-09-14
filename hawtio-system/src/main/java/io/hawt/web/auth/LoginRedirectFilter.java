package io.hawt.web.auth;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Redirect to login page when authentication is enabled.
 */
public class LoginRedirectFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(LoginRedirectFilter.class);

    private AuthenticationConfiguration authConfiguration;
    private List<String> unsecuredPaths;

    private Redirector redirector = new Redirector();

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());
        unsecuredPaths = convertCsvToList(filterConfig.getInitParameter("unsecuredPaths"));
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);
        String path = httpRequest.getServletPath();

        if (authConfiguration.isEnabled() && !authConfiguration.isKeycloakEnabled()
            && !isAuthenticated(session) && isSecuredPath(path)) {
            redirector.doRedirect(httpRequest, httpResponse, AuthenticationConfiguration.LOGIN_URL);
        } else {
            chain.doFilter(request, response);
        }
    }

    private boolean isAuthenticated(HttpSession session) {
        return session != null && session.getAttribute("subject") != null;
    }

    List<String> convertCsvToList(String unsecuredPaths) {
        return unsecuredPaths != null
            ? Strings.split(unsecuredPaths, ",")
            : Collections.EMPTY_LIST;
    }

    boolean isSecuredPath(String path) {
        return !unsecuredPaths.stream().anyMatch(path::startsWith);
    }

    @Override
    public void destroy() {
    }

    public void setRedirector(Redirector redirector) {
        this.redirector = redirector;
    }
}
