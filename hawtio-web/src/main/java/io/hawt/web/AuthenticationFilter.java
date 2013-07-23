package io.hawt.web;

import io.hawt.system.Authenticator;
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

    private static final String HEADER_WWW_AUTHENTICATE = "WWW-Authenticate";

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

        boolean doAuthenticate = !(path.startsWith("/jolokia") && path.startsWith("/proxy") && path.startsWith("/upload") && path.startsWith("/javadoc"));

        if (doAuthenticate) {
            LOG.debug("Doing authentication and authorization for path {}", path);
            if (Authenticator.authenticate(realm, role, httpRequest)) {
                chain.doFilter(request, response);
            } else {
                doAuthPrompt((HttpServletResponse)response);
            }
        } else {
            chain.doFilter(request, response);
        }
    }


    public void doAuthPrompt(HttpServletResponse response) {
        // request authentication
        try {
            response.setHeader(HEADER_WWW_AUTHENTICATE, Authenticator.AUTHENTICATION_SCHEME_BASIC + " realm=\"" + this.realm + "\"");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentLength(0);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send auth response: {}", ioe);
        }

    }



    @Override
    public void destroy() {
        LOG.info("Destroying hawtio authentication filter");
    }
}
