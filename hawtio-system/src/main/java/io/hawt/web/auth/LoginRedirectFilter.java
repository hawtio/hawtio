package io.hawt.web.auth;

import io.hawt.util.Strings;

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

/**
 * Redirect to login page when authentication is enabled.
 */
public class LoginRedirectFilter implements Filter {

    private AuthenticationConfiguration authConfiguration;
    private List<String> unsecuredPaths;

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
            redirect(httpRequest, httpResponse);
        } else {
            chain.doFilter(request, response);
        }
    }

    private boolean isAuthenticated(HttpSession session) {
        return session != null && session.getAttribute("subject") != null;
    }

    private void redirect(HttpServletRequest httpRequest, HttpServletResponse httpResponse) throws IOException {
    	String schem=httpRequest.getServletContext().getInitParameter("scheme");
    	if (null == schem) {
                System.out.println ("scheme is Null, using default");
    		schem = "http";
    	}
    	
    	System.out.println(schem+" -- LoginRedirectFilter");
    	String portstr = ":"+httpRequest.getServerPort();
    	String redirURL=schem+"://"+httpRequest.getServerName()+portstr+httpRequest.getContextPath() + AuthenticationConfiguration.LOGIN_URL;
        httpResponse.sendRedirect(redirURL);
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
}
