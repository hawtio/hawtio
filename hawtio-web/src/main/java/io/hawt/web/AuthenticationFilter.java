package io.hawt.web;

import io.hawt.system.Authenticator;
import io.hawt.system.Helpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * @author Stan Lewis
 */
public class AuthenticationFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(AuthenticationFilter.class);

    private String realm;
    private String role;
    private boolean enabled;


    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

        realm = (String) filterConfig.getServletContext().getAttribute("realm");
        role = (String) filterConfig.getServletContext().getAttribute("role");
        enabled = (Boolean) filterConfig.getServletContext().getAttribute("authEnabled");

        if (enabled) {
            LOG.info("Starting hawtio authentication filter, authentication realm: \"" + realm + "\" authorized role: \"" + role + "\"");
        } else {
            LOG.info("Starting hawtio authentication filter, authentication disabled");
        }

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        if (realm == null || realm.equals("") || !enabled) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest)request;
        HttpSession session = httpRequest.getSession(false);

        LOG.debug("Handling request for path {}", httpRequest.getServletPath());

        if (session != null) {
            chain.doFilter(request, response);
            return;
        }

        String path = httpRequest.getServletPath();

        boolean doAuthenticate = path.startsWith("/auth") ||
                                 path.startsWith("/jolokia") ||
                                 path.startsWith("/upload");

        if (doAuthenticate) {
            LOG.debug("Doing authentication and authorization for path {}", path);
            switch (Authenticator.authenticate(realm, role, httpRequest)) {
                case AUTHORIZED:
                    chain.doFilter(request, response);
                    break;
                case NOT_AUTHORIZED:
                    Helpers.doForbidden((HttpServletResponse) response);
                    break;
                case NO_CREDENTIALS:
                    //doAuthPrompt((HttpServletResponse)response);
                    Helpers.doForbidden((HttpServletResponse) response);
                    break;
            }
        } else {
            chain.doFilter(request, response);
        }
    }


    @Override
    public void destroy() {
        LOG.info("Destroying hawtio authentication filter");
    }
}
