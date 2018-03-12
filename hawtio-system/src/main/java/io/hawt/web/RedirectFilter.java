package io.hawt.web;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.system.HawtioProperty;
import io.hawt.util.Strings;

public class RedirectFilter implements Filter {

    /**
     * Name of the filter init parameter containing comma-separated list of
     * sub-contexts which are to be allowed in addition to defaults.
     */
    public static final String ALLOWED_CONTEXTS = "allowedContexts";

    private static final Logger LOG = LoggerFactory.getLogger(RedirectFilter.class);

    private static final String KNOWN_SERVLETS[] = { "jolokia", "auth", "upload",
            "javadoc", "proxy", "springBatch", "user", "plugin", "exportContext",
            "contextFormatter", "refresh", "keycloak" };

    private final Set<String> knownServlets = new HashSet<>(
            Arrays.asList(KNOWN_SERVLETS));

    private int pathIndex;

    @Override
    public void init(final FilterConfig cfg) throws ServletException {
        final String servletPath = (String) cfg.getServletContext()
                .getAttribute(HawtioProperty.SERVLET_PATH);
        if (servletPath == null) {
            this.pathIndex = 0; // assume hawtio is served from root
        } else {
            this.pathIndex = Strings.webContextPath(servletPath)
                    .replaceAll("[^/]+", "").length();
        }

        final String allowedContexts = cfg.getInitParameter(ALLOWED_CONTEXTS);
        if (allowedContexts != null) {
            for (final String s : allowedContexts.split(",")) {
                knownServlets.add(
                        Strings.webContextPath(s.trim()).replaceAll("^/+|/+$", ""));
            }
        }

        if (LOG.isDebugEnabled()) {
            LOG.debug("Known servlets are: {}", new TreeSet<>(knownServlets));
        }
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        if (req instanceof HttpServletRequest
                && res instanceof HttpServletResponse) {
            process((HttpServletRequest) req, (HttpServletResponse) res, chain);
        } else {
            chain.doFilter(req, res);
        }
    }

    private void process(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws IOException, ServletException {
        final RelativeRequestUri uri = new RelativeRequestUri(req, pathIndex);
        LOG.debug("Accessing [{}], hawtio path is [{}]", req.getRequestURI(),
                uri.getUri());

        if (isValid(uri)) {
            LOG.debug("[{}] is a valid hawtio path, allowing", uri.getUri());
            chain.doFilter(req, res);
        } else {
            // if we've gotten here, we need to redirect to hawtio root which in turn
            // should then be redirected to index.html

            final String newUri = buildRedirectUri(uri);
            LOG.debug("[{}] is an invalid hawtio path, redirecting to: {}",
                    uri.getUri(), newUri);
            res.sendRedirect(newUri);
        }
    }

    protected boolean isValid(final RelativeRequestUri uri) {
        // pass along if it's the top-level context
        if (uri.getComponents().length == 0) {
            return true;
        }

        // pass along (hopefully) any files
        if (uri.getLastComponent().contains(".")
                && !uri.getLastComponent().endsWith(".profile")) {
            // TODO if we get a 404 and we know its not a standard
            // file like a .css / .js / image then should we still
            // return the index.html?
            // e.g. what if we are viewing a properties file inside the wiki?
            return true;
        }

        // pass along requests for our known servlets
        if (knownServlets.contains(uri.getComponents()[0])) {
            return true;
        }

        return false;
    }

    protected String buildRedirectUri(final RelativeRequestUri uri) {
        final StringBuilder b = new StringBuilder();
        if (!uri.getPrefix().startsWith("/")) {
            b.append('/');
        }

        b.append(uri.getPrefix());
        if (b.charAt(b.length() - 1) != '/') {
            b.append('/');
        }
        b.append('#');

        for (final String p : uri.getComponents()) {
            b.append('/').append(p);
        }

        if (uri.getRequest().getQueryString() != null
                && !"".equals(uri.getRequest().getQueryString())) {
            b.append("?").append(uri.getRequest().getQueryString());
        }

        return b.toString();
    }

    @Override
    public void destroy() {
        // noop
    }
}
