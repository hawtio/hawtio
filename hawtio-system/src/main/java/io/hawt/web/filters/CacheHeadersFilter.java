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

    private ServletContext servletContext;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);
        servletContext = filterConfig.getServletContext();
    }

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response)
        throws IOException {
        if (!cacheInBrowser(request)) {
            response.setHeader("Cache-Control", "max-age=0, no-cache, must-revalidate, proxy-revalidate, private");
            response.setHeader("Pragma", "no-cache");
        }
    }

    public boolean cacheInBrowser(HttpServletRequest request) throws MalformedURLException {

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

        String resourcePath = joinPaths(servletPath, pathInfo);

        // Don't cache the index.html file.
        if (resourcePath.equals("/") || resourcePath.endsWith("/index.html")) {
            return false;
        }

        // Cache the other static resources.
        return servletContext.getResource(resourcePath) != null;
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
