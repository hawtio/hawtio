package io.hawt.web.filters;

import java.io.IOException;
import java.net.MalformedURLException;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CacheHeadersFilter extends HttpHeaderFilter {

    static String INCLUDE_REQUEST_URI = "jakarta.servlet.include.request_uri";
    static String INCLUDE_SERVLET_PATH = "jakarta.servlet.include.servlet_path";
    static String INCLUDE_PATH_INFO = "jakarta.servlet.include.path_info";

    static final String HASHED_RESOURCES_PATH = "/static/";
    static final String NO_CACHE = "max-age=0, no-cache, must-revalidate, proxy-revalidate, private";
    static final String CACHE_IMMUTABLE = "public, max-age=31536000, immutable";
    static final String CACHE_REVALIDATE = "no-cache";

    private ServletContext servletContext;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);
        servletContext = filterConfig.getServletContext();
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response)
        throws IOException {
        String resourcePath = cacheableResourcePath(request);
        if (resourcePath == null) {
            response.setHeader("Cache-Control", NO_CACHE);
        } else if (resourcePath.startsWith(HASHED_RESOURCES_PATH)) {
            response.setHeader("Cache-Control", CACHE_IMMUTABLE);
        } else {
            response.setHeader("Cache-Control", CACHE_REVALIDATE);
        }
    }

    /**
     * Returns the path of the static resource that may be cached by the browser, or {@code null} if the
     * response should not be cached at all.
     */
    private String cacheableResourcePath(HttpServletRequest request) throws MalformedURLException {

        // only GET/HEAD responses can be cached by browsers. This also skips the resource lookup
        // for Jolokia POST requests, which the UI sends every few seconds
        String method = request.getMethod();
        if (!"GET".equals(method) && !"HEAD".equals(method)) {
            return null;
        }

        String servletPath = null;
        String pathInfo = null;

        if (request.getAttribute(INCLUDE_REQUEST_URI) != null) {
            servletPath = (String) request.getAttribute(INCLUDE_SERVLET_PATH);
            pathInfo = (String) request.getAttribute(INCLUDE_PATH_INFO);
        }
        if (servletPath == null) {
            servletPath = request.getServletPath();
            pathInfo = request.getPathInfo();
        }

        // Jolokia and proxy responses are dynamic and never served from static resources
        if ("/jolokia".equals(servletPath) || "/proxy".equals(servletPath)) {
            return null;
        }

        String resourcePath = joinPaths(servletPath, pathInfo);

        // Don't cache the index.html file.
        if (resourcePath.equals("/") || resourcePath.endsWith("/index.html")) {
            return null;
        }

        // Cache the other static resources.
        return servletContext.getResource(resourcePath) != null ? resourcePath : null;
    }

    private String joinPaths(String p1, String p2) {
        if (p1 == null) {
            p1 = "";
        }
        if (p2 == null) {
            p2 = "";
        }
        if (p1.isEmpty())
            return p2;
        if (p2.isEmpty())
            return p1;
        return trimSuffix(p1, "/") + "/" + trimPrefix(p2, "/");
    }

    static String trimPrefix(String value, String prefix) {
        if (value != null && value.startsWith(prefix)) {
            return value.substring(prefix.length());
        } else {
            return value;
        }
    }

    static String trimSuffix(String value, String suffix) {
        if (value != null && value.endsWith(suffix)) {
            return value.substring(0, value.length() - suffix.length());
        } else {
            return value;
        }
    }

}
