package io.hawt.web.auth;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import io.hawt.system.HawtioProperty;
import io.hawt.util.Strings;
import io.hawt.web.ServletHelpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * If the user has a session, this will ensure it will expire if the user hasn't clicked on any links
 * within the session expiry period
 */
public class SessionExpiryFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(SessionExpiryFilter.class);

    public static final String ATTRIBUTE_LAST_ACCESS = "LastAccess";

    private static final List<String> IGNORED_PATHS = Collections.unmodifiableList(Arrays.asList("jolokia", "proxy"));

    private ServletContext context;
    private AuthenticationConfiguration authConfiguration;
    private int pathIndex;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        context = filterConfig.getServletContext();
        authConfiguration = AuthenticationConfiguration.getConfiguration(context);

        String servletPath = (String) filterConfig.getServletContext().getAttribute(HawtioProperty.SERVLET_PATH);
        if (servletPath == null) {
            this.pathIndex = 0; // assume hawtio is served from root
        } else {
            this.pathIndex = Strings.webContextPath(servletPath).replaceAll("[^/]+", "").length();
        }
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        if (servletRequest instanceof HttpServletRequest
            && servletResponse instanceof HttpServletResponse) {
            process((HttpServletRequest) servletRequest, (HttpServletResponse) servletResponse, filterChain);
        } else {
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    private void writeOk(HttpServletResponse response) throws IOException, ServletException {
        response.setContentType("text/html;charset=UTF-8");
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
        if (context.getAttribute(AuthenticationConfiguration.AUTHENTICATION_ENABLED) == null) {
            // most likely the authentication filter hasn't been started up yet, let this request through and it can be dealt with by the authentication filter
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = request.getSession(false);
        boolean enabled = (boolean) context.getAttribute(AuthenticationConfiguration.AUTHENTICATION_ENABLED);
        final RelativeRequestUri uri = new RelativeRequestUri(request, pathIndex);
        LOG.debug("Accessing [{}], hawtio path is [{}]", request.getRequestURI(), uri.getUri());

        // pass along if it's the top-level context
        if (uri.getComponents().length == 0) {
            if (session != null) {
                long now = System.currentTimeMillis();
                updateLastAccess(session, now);
            }
            chain.doFilter(request, response);
            return;
        }

        String subContext = uri.getComponents()[0];
        if (session == null || session.getMaxInactiveInterval() < 0) {
            if (subContext.equals("refresh") && !enabled) {
                LOG.debug("Authentication disabled, received refresh response, responding with ok");
                writeOk(response);
            } else {
                chain.doFilter(request, response);
                /*
                if (!enabled) {
                    LOG.debug("Authentication disabled, allowing request");
                    chain.doFilter(request, response);
                } else if (request.getHeader(Authenticator.HEADER_AUTHORIZATION) != null) {
                    // there's no session, but we have request with authentication attempt
                    // let's pass it further the filter chain - if authentication will fail, user will get 403 anyway
                    chain.doFilter(request, response);
                } else {
                    if (noCredentials401 && subContext.equals("jolokia")) {
                        LOG.debug("Authentication enabled, noCredentials401 is true, allowing request for {}",
                            subContext);
                        chain.doFilter(request, response);
                    } else if (subContext.equals("jolokia") ||
                        subContext.equals("proxy") ||
                        subContext.equals("user") ||
                        subContext.equals("exportContext") ||
                        subContext.equals("contextFormatter") ||
                        subContext.equals("upload")) {
                        LOG.debug("Authentication enabled, denying request for {}", subContext);
                        ServletHelpers.doForbidden(response);
                    } else {
                        LOG.debug("Authentication enabled, but allowing request for {}", subContext);
                        chain.doFilter(request, response);
                    }
                }
                */
            }
            return;
        }

        int maxInactiveInterval = session.getMaxInactiveInterval();
        long now = System.currentTimeMillis();
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
}
