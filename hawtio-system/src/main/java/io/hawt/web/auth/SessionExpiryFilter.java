package io.hawt.web.auth;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import io.hawt.web.ServletHelpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * If the user has a session, this will ensure it will expire if the user hasn't clicked on any links
 * within the session expiry period
 */
public class SessionExpiryFilter implements Filter {

    private static final Logger LOG = LoggerFactory.getLogger(SessionExpiryFilter.class);

    /**
     * Hawtio system property:
     * The name of the servlet context attribute holding hawtio deployment path
     * relative to the context root. By default, when hawtio is launched in
     * stand-alone mode, its path is assumed to be at the root of the servlet. But
     * in certain scenarios this might not be the case. For example, when running
     * under Spring Boot, actual hawtio path can potentially consist of servlet
     * prefix, management context path as well as hawtio endpoint path.
     */
    public static final String SERVLET_PATH = "hawtioServletPath";

    public static final String ATTRIBUTE_LAST_ACCESS = "LastAccess";

    private static final List<String> IGNORED_PATHS = List.of("jolokia", "proxy");

    private AuthenticationConfiguration authConfiguration;
    private int pathIndex;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        authConfiguration = AuthenticationConfiguration.getConfiguration(filterConfig.getServletContext());

        this.pathIndex = ServletHelpers.hawtioPathIndex(filterConfig.getServletContext());
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        LOG.trace("Applying {}", getClass().getSimpleName());

        if (servletRequest instanceof HttpServletRequest
            && servletResponse instanceof HttpServletResponse) {
            process((HttpServletRequest) servletRequest, (HttpServletResponse) servletResponse, filterChain);
        } else {
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    private void writeOk(HttpServletResponse response) throws IOException {
        response.setContentType("text/plain;charset=UTF-8");
        try (OutputStream out = response.getOutputStream()) {
            out.write("ok".getBytes());
            out.flush();
        }
    }

    private void updateLastAccess(HttpSession session, long now) {
        session.setAttribute(ATTRIBUTE_LAST_ACCESS, now);
        LOG.debug("Reset LastAccess to: {}", now);
    }

    private void process(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpSession session = request.getSession(false);
        final RelativeRequestUri uri = new RelativeRequestUri(request, pathIndex);
        LOG.debug("Accessing [{}], hawtio path is [{}]", request.getRequestURI(), uri.getUri());

        // pass along if it's the top-level context
        if (uri.getComponents().length == 0) {
            if (session != null) {
                updateLastAccess(session, now());
            }
            chain.doFilter(request, response);
            return;
        }

        String subContext = uri.getComponents()[0];
        if (session == null || session.getMaxInactiveInterval() < 0 || "auth/logout".equals(uri.getUri())) {
            if (subContext.equals("refresh")) {
                if (!authConfiguration.isEnabled()) {
                    LOG.debug("Authentication disabled, received refresh response, responding with ok");
                } else if (session == null) {
                    // authentication performed outside of LoginServlet (no session created)
                    LOG.debug("No session available, responding with ok");
                }
                writeOk(response);
            } else {
                chain.doFilter(request, response);
            }
            return;
        }

        int maxInactiveInterval = session.getMaxInactiveInterval();
        long now = now();
        if (session.getAttribute(ATTRIBUTE_LAST_ACCESS) != null) {
            long lastAccess = (long) session.getAttribute(ATTRIBUTE_LAST_ACCESS);
            long remainder = (now - lastAccess) / 1000;
            LOG.debug("Session expiry: {}s, duration since last access: {}s", maxInactiveInterval, remainder);
            if (remainder > maxInactiveInterval) {
                LOG.info("Expiring session due to inactivity");
                session.invalidate();
                ServletHelpers.doForbidden(response);
                return;
            }
        }

        if (subContext.equals("refresh")) {
            updateLastAccess(session, now);
            writeOk(response);
            return;
        }

        LOG.debug("SubContext: {}", subContext);
        if (IGNORED_PATHS.contains(subContext) && session.getAttribute(ATTRIBUTE_LAST_ACCESS) != null) {
            LOG.debug("Not updating LastAccess");
        } else {
            updateLastAccess(session, now);
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // noop
    }

    protected long now() {
        // easier testing...
        return System.currentTimeMillis();
    }

}
