package io.hawt.web.auth;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Redirect to login page when authentication is enabled.
 */
public class LoginRedirectFilter implements Filter {

    private AuthenticationConfiguration configuration;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        configuration = ConfigurationManager.getConfiguration(filterConfig.getServletContext());
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);

        if (configuration.isEnabled() && (session == null || session.getAttribute("subject") == null)) {
            redirect(httpRequest, httpResponse);
        } else {
            chain.doFilter(request, response);
        }
    }

    static void redirect(HttpServletRequest httpRequest, HttpServletResponse httpResponse) throws IOException {
        httpResponse.sendRedirect(httpRequest.getContextPath() + "/auth/login");
    }

    @Override
    public void destroy() {
    }
}
