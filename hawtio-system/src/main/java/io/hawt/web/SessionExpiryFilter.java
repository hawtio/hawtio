package io.hawt.web;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
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

import io.hawt.system.Helpers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * If the user has a session this will ensure it will expire if the user hasn't clicked on any links within the session expiry period
 */
public class SessionExpiryFilter implements Filter {

    private static final transient Logger LOG = LoggerFactory.getLogger(SessionExpiryFilter.class);

    private static final String ignoredPaths[] = {"jolokia", "proxy"};
    private List<String> ignoredPathList;
    private ServletContext context;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        ignoredPathList = Arrays.asList(ignoredPaths);
        context = filterConfig.getServletContext();
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
        OutputStream out = response.getOutputStream();
        try {
            out.write("ok".getBytes());
            out.flush();
        } finally {
            out.close();
        }
    }

    private void updateLastAccess(HttpSession session, long now) {
        session.setAttribute("LastAccess", now);
        LOG.debug("Reset LastAccess to: ", session.getAttribute("LastAccess"));
    }

    private void process(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (context == null || context.getAttribute("authenticationEnabled") == null) {
            // most likely the authentication filter hasn't been started up yet, let this request through and it can be dealt with by the authentication filter
            chain.doFilter(request, response);
            return;
        }
        HttpSession session = request.getSession(false);
        boolean enabled = (boolean) context.getAttribute("authenticationEnabled");
        String uri = request.getRequestURI();
        if (uri.startsWith("/")) {
            uri = uri.substring(1);
        }
        if (uri.endsWith("/")) {
            uri = uri.substring(0, uri.length() - 1);
        }
        String[] uriParts = Pattern.compile("/").split(uri);
        // pass along if it's the top-level context
        if (uriParts.length == 1) {
            if (session != null) {
                long now = System.currentTimeMillis();
                updateLastAccess(session, now);
            }
            chain.doFilter(request, response);
            return;
        }
        String myContext = uriParts[0];
        String subContext = uriParts[1];
        if (session == null || session.getMaxInactiveInterval() < 0) {
            if (subContext.equals("refresh") && !enabled) {
                LOG.debug("Authentication disabled, received refresh response, responding with ok");
                writeOk(response);
            } else {
                // see: https://issues.jboss.org/browse/ENTESB-2418
                // it won't allow unauthenticated requests anyway
                String userAgent = request.getHeader("User-Agent") == null ? "" : request.getHeader("User-Agent").toLowerCase();
                if (!enabled || userAgent.contains("curl")) {
                    LOG.debug("Authentication disabled, allowing request");
                    chain.doFilter(request, response);
                } else {
                    if (subContext.equals("jolokia") ||
                            subContext.equals("proxy") ||
                            subContext.equals("user") ||
                            subContext.equals("exportContext") ||
                            subContext.equals("contextFormatter") ||
                            subContext.equals("upload")) {
                        LOG.debug("Authentication enabled, denying request for {}", subContext);
                        Helpers.doForbidden(response);
                    } else {
                        LOG.debug("Authentication enabled, but allowing request for {}", subContext);
                        chain.doFilter(request, response);
                    }
                }
            }
            return;
        }
        int maxInactiveInterval = session.getMaxInactiveInterval();
        long now = System.currentTimeMillis();
        if (session.getAttribute("LastAccess") != null) {
            long lastAccess = (long) session.getAttribute("LastAccess");
            long remainder = (now - lastAccess) / 1000;
            LOG.debug("Session expiry: {}, duration since last access: {}", maxInactiveInterval, remainder);
            if (remainder > maxInactiveInterval) {
                LOG.info("Expiring session due to inactivity");
                session.invalidate();
                Helpers.doForbidden(response);
                return;
            }
        }
        if (subContext.equals("refresh")) {
            updateLastAccess(session, now);
            writeOk(response);
            return;
        }
        LOG.debug("Top level context: {} subContext: {}", myContext, subContext);
        if (ignoredPathList.contains(subContext) && session.getAttribute("LastAccess") != null) {
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
