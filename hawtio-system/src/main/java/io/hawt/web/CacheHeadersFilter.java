package io.hawt.web;

import java.io.IOException;
import java.net.MalformedURLException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CacheHeadersFilter implements Filter {

    static String INCLUDE_REQUEST_URI = "javax.servlet.include.request_uri";
    static String INCLUDE_SERVLET_PATH = "javax.servlet.include.servlet_path";
    static String INCLUDE_PATH_INFO = "javax.servlet.include.path_info";

    private ServletContext servletContext;

    public void init(FilterConfig filterConfig) throws ServletException {
        servletContext = filterConfig.getServletContext();
    }

    public void destroy() {
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        if (!cacheInBrowser(req)) {
            resp.setHeader("Cache-Control", "max-age=0, no-cache, must-revalidate, proxy-revalidate, private");
            resp.setHeader("Pragma", "no-cache");
        }
        chain.doFilter(request, response);
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
